import Swal from "sweetalert2";
import '../shared/alertStyle.css';

export default async function alertPop(title, message, icon='success', buttonText='ok'){
    const result = await Swal.fire({
        title: title,
        text: message,
        icon: icon,
        confirmButtonText: buttonText,
        color: '#000000',
        iconColor: '#E7B901',
        position: 'center',
        buttonsStyling: false,
        customClass: {
            confirmButton: 'btn--primary',
            popup: 'alert--container'
        }
        
    });
    return result
}