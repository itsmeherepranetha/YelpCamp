const BaseJOI=require('joi');
const sanitizeHTML=require('sanitize-html');

// to avoid cross-site scripting(XSS)
// this is a custom extension on top of joi , so that , we can validate the requests that are sent , so that we can avoid cross-scripting
const extension=(joi)=>({
    type:'string',
    base:joi.string(),
    messages:{
        'string.escapeHTML':'{{#label}} must not include HTML!'
    },
    rules:{
        escapeHTML:{
            // checking if the request is valid string , or has some HTML element in it
            validate(value,helpers){
                const clean=sanitizeHTML(value,{
                    allowedTags:[], // nothing of HTML is allowed
                    allowedAttributes:{} // again nothing is allowed
                });
                if(clean!==value)return helpers.error('string.escapeHTML',{value});
                return clean;
            }
        }
    }
});

const joi=BaseJOI.extend(extension); // adding the extension on top of the original joi, to prevent XSS
// now we can use the extension , to any attribute we want


// validation schema , so that stupid stuff is not written in the add and edit campground page
// also even if some of that stupid stuff is not possible to write from browser or the client side, its can still be done through postman
module.exports.CampgroundSchema=joi.object({
    campground:joi.object({
        title:joi.string().required().escapeHTML(),
        price:joi.number().required().min(0),
        location:joi.string().required().escapeHTML(),
        description:joi.string().required().escapeHTML()
    }).required(),  // the main object , and its required also
    deleteImages:joi.array() // to delete some images
});

// again , just to avoid manipulation through backdoor(like postman)
module.exports.reviewSchema=joi.object({
    review:joi.object({
        rating:joi.number().required().min(1).max(5),
        body:joi.string().required().escapeHTML()
    }).required()
});