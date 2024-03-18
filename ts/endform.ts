const template_text_p = document.querySelector('#template_text') as HTMLParagraphElement
const template_text_param = new URLSearchParams(window.location.search).get('template_text') || ''
template_text_p.innerHTML = `TEMPLATE TEXT: <strong>"${template_text_param}"</strong>`

const link_wa = document.querySelector('#link_wa') as HTMLAnchorElement
link_wa.href = `https://wa.me/6282186647658?text=${window.encodeURI(template_text_param)}`

// const qrcode = new QRCode(
//     document.querySelector('#qrcode'),
//     'http://jindo.dev.naver.com/collie',
// )
