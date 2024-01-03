module.exports.setFlash = function(req, res, next){
    res.locals.flash = {
        'success' : req.flash('success'),
        'error' : req.flash('error') // not defined 
    }
    // console.log('b' ,res.locals.flash.success); // can't use req.flash('success') flash is displayed just once
    next();
}