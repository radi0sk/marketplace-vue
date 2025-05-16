// src/services/cloudinary.js

const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'marketplace'); // Reemplaza con tu upload preset
  formData.append('cloud_name', 'dsfnladar'); // Reemplaza con tu cloud name

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/rony/image/upload`, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    console.log('Imagen subida exitosamente:', data.secure_url);
    return data.secure_url; // Retorna la URL pública de la imagen
  } catch (error) {
    console.error('Error subiendo la imagen:', error);
    return null;
  }
};

const deleteImage = async (publicId) => {
  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/rony/image/destroy`, {
      method: 'POST',
      body: JSON.stringify({
        public_id: publicId,
        api_key: '949681764298537', // Reemplaza con tu API Key
        api_secret: 's-fpq822vCf2MWKlK1y48-HDeks', // Reemplaza con tu API Secret
        timestamp: Math.floor(Date.now() / 1000),
      }),
    });
    const data = await response.json();
    console.log('Imagen eliminada exitosamente:', data);
    return data;
  } catch (error) {
    console.error('Error eliminando la imagen:', error);
    return null;
  }
};

export default {
  uploadImage,
  deleteImage,
};