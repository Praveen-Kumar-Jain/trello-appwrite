import { ID, storage } from "@/appwrite";

const uploadImage = async (file: File) => {
  if (!file) return;

  const fileUploaded = await storage.createFile(
    '6490858e7fb086d3adc1',
    ID.unique(),
    file
  );
  return fileUploaded;
};
export default uploadImage;
