document.addEventListener("scroll", ()=>{
    const nav=document.querySelector(".nav");
    if(document.body.scrollTop > 85 || document.documentElement.scrollTop > 85){
        nav.classList.remove("nav-hidden");
        nav.classList.add("nav-visible");
    }
    else{
        nav.classList.add("nav-hidden");
        nav.classList.remove("nav-visible");
    }
})