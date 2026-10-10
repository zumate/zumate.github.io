/* efeitos.js — polimento sutil compartilhado entre as páginas.
   Tudo respeita prefers-reduced-motion. */
(function () {
  var reduz = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── revela o body ao carregar ─────────────────────── */
  function revelar() { document.body.classList.add('is-ready'); }
  if (document.readyState !== 'loading') revelar();
  else document.addEventListener('DOMContentLoaded', revelar);

  /* ── fade ao navegar entre páginas internas ────────── */
  document.addEventListener('click', function (e) {
    if (reduz) return;
    var a = e.target.closest && e.target.closest('a');
    if (!a) return;

    var href = a.getAttribute('href');
    if (!href) return;
    // ignora links externos, nova aba, âncoras e protocolos especiais
    if (a.target === '_blank' || a.hasAttribute('download')) return;
    if (/^(https?:)?\/\//i.test(href) && a.host !== location.host) return;
    if (href[0] === '#' || /^(mailto:|tel:)/i.test(href)) return;
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

    e.preventDefault();
    document.body.classList.add('is-leaving');
    setTimeout(function () { window.location.href = a.href; }, 250);
  });

  /* ── parallax do mouse na home ─────────────────────── */
  var grupo = document.querySelector('.home-cards');
  if (grupo && !reduz) {
    var personagem = document.querySelector('.char-img');
    var alvoX = 0, atualX = 0, rodando = false;
    var MAX = 10; // px

    /* parallax SÓ horizontal: mover na vertical sobe os botões (cortando-os
       no topo) e descola a personagem do rodapé. Horizontal não corta nada. */
    function loop() {
      atualX += (alvoX - atualX) * 0.08;
      grupo.style.setProperty('--px', atualX.toFixed(2) + 'px');
      grupo.style.setProperty('--py', '0px');
      if (personagem) {
        personagem.style.setProperty('--cx', (-atualX * 1.6).toFixed(2) + 'px');
        personagem.style.setProperty('--cy', '0px');
      }
      if (Math.abs(alvoX - atualX) > 0.1) {
        requestAnimationFrame(loop);
      } else {
        rodando = false;
      }
    }
    function ativar() { if (!rodando) { rodando = true; requestAnimationFrame(loop); } }

    window.addEventListener('mousemove', function (e) {
      alvoX = ((e.clientX / window.innerWidth) - 0.5) * 2 * MAX;
      ativar();
    });
    window.addEventListener('mouseleave', function () {
      alvoX = 0; ativar();
    });
  }

  /* ── pop-ups: "sobre" e "desenhos em destaque" ─────── */
  function abrirModal(id) {
    var m = document.getElementById(id);
    if (!m) return;
    m.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function fecharModal(m) {
    m.hidden = true;
    document.body.style.overflow = '';
  }

  var cardSobre = document.querySelector('.card-sobre');
  if (cardSobre) cardSobre.addEventListener('click', function () { abrirModal('modal-sobre'); });

  var cardDesenhos = document.querySelector('.card-desenhos');
  if (cardDesenhos) cardDesenhos.addEventListener('click', function () { abrirModal('modal-desenhos'); });

  Array.prototype.forEach.call(document.querySelectorAll('.modal-backdrop'), function (m) {
    m.addEventListener('click', function (e) {
      if (e.target === m || (e.target.closest && e.target.closest('.modal-close'))) fecharModal(m);
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      Array.prototype.forEach.call(document.querySelectorAll('.modal-backdrop:not([hidden])'), fecharModal);
    }
  });

  /* ── explosão de billzinhas ao clicar em "Extra" ───── */
  var extra = document.querySelector('.card-extra');
  if (extra && !reduz) {
    extra.addEventListener('click', function (e) {
      e.preventDefault(); // easter egg: não navega, só explode
      var r = extra.getBoundingClientRect();
      explodirBillzinhas(r.left + r.width / 2, r.top + r.height / 2);
    });
  }

  function explodirBillzinhas(ox, oy) {
    var N = 18;
    var W = window.innerWidth, H = window.innerHeight;
    for (var i = 0; i < N; i++) {
      var el = document.createElement('img');
      el.src = 'imagens/billzinha.webp';
      el.className = 'billzinha';
      var size = 30 + Math.random() * 30;
      el.style.width = size + 'px';
      document.body.appendChild(el);

      var ang = Math.random() * Math.PI * 2;
      var sp = 9 + Math.random() * 11;
      animar(el, {
        x: ox - size / 2, y: oy - size / 2, size: size,
        vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 7,
        rot: Math.random() * 360, vrot: (Math.random() - 0.5) * 26,
        W: W, H: H
      });
    }
  }

  function animar(el, s) {
    var grav = 0.5, rest = 0.62, fric = 0.992;
    var still = 0, life = 0, fading = false, op = 1;
    function frame() {
      life++;
      s.vy += grav; s.vx *= fric;
      s.x += s.vx; s.y += s.vy;
      // quica nas paredes
      if (s.x < 0) { s.x = 0; s.vx = -s.vx * rest; }
      else if (s.x + s.size > s.W) { s.x = s.W - s.size; s.vx = -s.vx * rest; }
      if (s.y < 0) { s.y = 0; s.vy = -s.vy * rest; }
      else if (s.y + s.size > s.H) { s.y = s.H - s.size; s.vy = -s.vy * rest; s.vx *= 0.86; }
      s.rot += s.vrot; s.vrot *= 0.99;

      var speed = Math.abs(s.vx) + Math.abs(s.vy);
      if (speed < 1.2 && s.y + s.size > s.H - 2) still++; else still = 0;
      if (!fading && (still > 18 || life > 360)) fading = true;
      if (fading) op -= 0.05;

      el.style.transform = 'translate(' + s.x.toFixed(1) + 'px,' + s.y.toFixed(1) + 'px) rotate(' + s.rot.toFixed(1) + 'deg)';
      el.style.opacity = op;
      if (op <= 0) { el.remove(); return; }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
})();
