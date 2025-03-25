export const test = (req,res)=> {
    res.json({message: 'API is working!'});
};

export const getPackages = async(req,res,next)=> {
    try {
        const packages = await Package.find({});
        res.json(packages);
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching packages',
            error: error.message
        });
    } 
}
export const updateUser = async(req,res,next)=> {

        
}