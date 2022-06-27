document.addEventListener("scroll", ()=>{
    const nav=document.querySelector(".nav");
    const alertCloseBtn=document.querySelector(".alert-message .close-btn");
    if(document.body.scrollTop > 85 || document.documentElement.scrollTop > 85){
        nav.classList.remove("nav-hidden");
        nav.classList.add("nav-visible");
    }
    else{
        nav.classList.add("nav-hidden");
        nav.classList.remove("nav-visible");
    }
    document.addEventListener('click',function(e){
        if(e.target?.classList.contains("close-btn")){
            e.stopImmediatePropagation();
            e.target.parentElement.style.display="none";
        }
     });
     window.setTimeout(()=>{
        if(alertCloseBtn)
            alertCloseBtn.parentElement.style.display="none";
    },5000);
})