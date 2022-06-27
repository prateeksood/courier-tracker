module.exports=(request,response,next)=>{
    response.locals.success=request.flash('success');
    response.locals.error=request.flash('error');
    next();
  }