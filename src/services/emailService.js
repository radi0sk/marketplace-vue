import { functions } from '@/services/firebase';
import { httpsCallable } from 'firebase/functions';

export const sendEmail = async (emailData) => {
  try {
    // Si estás usando Cloud Functions
    const sendEmailFunction = httpsCallable(functions, 'sendEmail');
    await sendEmailFunction(emailData);
    
    // Alternativa si no usas Cloud Functions:
    // await fetch('TU_ENDPOINT_DE_API', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(emailData),
    // });
    
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};