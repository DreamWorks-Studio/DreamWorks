import Package from "../model/package.model.js";

export const promo = async (req, res) => {
    try {
        const { packagename, packageDetails, packagePrice, packagevalidity } = req.body;

        if (!packagename || !packageDetails || !packagePrice || !packagevalidity) {
            return res.status(400).json({ error: "All fields are required." });
        }

        const newPackage = new Package({
            packagename,
            packageDetails,
            packagePrice,
            packagevalidity,
        });

        await newPackage.save();
        res.status(201).json({ message: "Adding package is successful" });

    } catch (error) {
        console.error("Error adding package:", error.message);
        res.status(500).json({ error: "Internal Server Error. Please try again." });
    }
};
