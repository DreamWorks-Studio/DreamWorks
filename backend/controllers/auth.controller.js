export const promo = async (req,res)=> {
    const { packagename, packageDetails,packagePrice,packagevalidity} = req.body;

    if(!packagename || !packageDetails || !packagePrice || !packagevalidity|| packagename === '' || packageDetails === '' || packagePrice === '' || packagevalidity === ''){
        return res.status(400).json({message:'All fields are required'});

    }
}

