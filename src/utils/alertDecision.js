import Swal from "sweetalert2";
import '../shared/alertStyle.css';

export default async function alertDecision(title, message, icon='success', confirmButtonText='ok', cancelButtonText='ok'){
    const result = await Swal.fire({
        title: title,
        text: message,
        icon: icon,
        confirmButtonText: confirmButtonText,
        showCancelButton: true,
        cancelButtonText: cancelButtonText,
        color: '#000000',
        iconColor: '#E7B901',
        position: 'center',
        buttonsStyling: false,
        customClass: {
            confirmButton: 'btn--primary',
            cancelButton: 'btn--cancel',
            popup: 'alert--container',
            actions: 'gap-4'
        }
        
    });
    return result
}
