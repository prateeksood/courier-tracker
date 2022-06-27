const steps=document.querySelectorAll(".timeline-step .icon");
steps.forEach((step,i)=>{
    step.innerHTML=i+1;
})
const leftMenu=document.querySelector(".left-menu");
const collapseBtn=document.querySelector(".collapse-btn");
collapseBtn?.addEventListener("click",()=>{
    if(leftMenu.getAttribute("data-collapse")==="true"){
        leftMenu.setAttribute("data-collapse","false");
        collapseBtn.querySelector("i").classList.add("fa-minus-square");
        collapseBtn.querySelector("i").classList.remove("fa-plus-square");
    }
    else{
        leftMenu.setAttribute("data-collapse","true");
        collapseBtn.querySelector("i").classList.remove("fa-minus-square");
        collapseBtn.querySelector("i").classList.add("fa-plus-square");
    }
})