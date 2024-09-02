import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';    // it is for file system module

cloudinary.config({
    cloud_name : process.env.CLOUD_NAME,
    api_key : process.env.API_KEY,
    api_secret : process.env.API_SECRET,
});

const uploadCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath)
            return null;
// it is used for uploading the file to cloudinary
       const response = await  cloudinary.uploader.upload(localFilePath ,{ resource_type : "auto"})

// file is uploaded
// console.log("File uploaded to cloudinary", response.url);

fs.unlinkSync(localFilePath); // it is used for deleting the file from local storage
return response;
    } catch (error) {
        

        fs.unlinkSync(localFilePath); // it is used for deleting the file from local storage
        console.log("Error uploading file to cloudinary", error);
        return null;

    }
}

// const deleteCloudinary = async (publicId) => {
//     try {
//         const result = await cloudinary.uploader.destroy(publicId);
//         return result;
//     } catch (error) {
//         throw new Error('Error deleting avatar from Cloudinary');
//     }
// };


export default uploadCloudinary;