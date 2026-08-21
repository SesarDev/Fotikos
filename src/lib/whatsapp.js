// Copia el texto y abre WhatsApp con él precargado (§10.2). No se puede
// enlazar a un grupo concreto sin su código de invitación, así que abre
// el selector de contacto/grupo estándar; el portapapeles es el respaldo
// si el usuario prefiere pegarlo a mano.
export async function shareToWhatsApp(text) {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    // el portapapeles puede fallar por permisos; el usuario aún puede copiar a mano
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
}
