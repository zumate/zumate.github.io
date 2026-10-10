const container = document.querySelector(".imagens")
const next = document.querySelector(".next")
const prev = document.querySelector(".prev")

function atualizar(){

const imgs = document.querySelectorAll(".imagens img")

imgs.forEach(img=>img.classList.remove("ativa"))

imgs[2].classList.add("ativa")

}

next.onclick = ()=>{

container.appendChild(container.firstElementChild)

atualizar()

}

prev.onclick = ()=>{

container.prepend(container.lastElementChild)

atualizar()

}

atualizar()