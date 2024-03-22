(() => {
    const url_params = common.get_url_params()
    const item = common.get_verif_item_from_url_params()

    const mailto = item.verif_dengan === 'LEM' ? G.EMAIL_LEM : G.EMAIL_DPM

    const email_confirmation = document.querySelector('#email_confirmation') as HTMLSpanElement
    email_confirmation.innerText = mailto

    const template_text_p = document.querySelector('#template_text') as HTMLParagraphElement
    const template_text_text = url_params.get('template_text') || ''
    template_text_p.innerHTML = `<strong>"${template_text_text}"</strong>`


    const link_email = document.querySelector('#link_email') as HTMLAnchorElement
    link_email.href = `mailto:${mailto}?subject=${template_text_text}
&body=
Yth.%0A
Kesekretariatan ${item.verif_dengan} FK UII%0A
di Tempat%0A
%0A
Assalamu’alaikum warahmatullahi wabarakatuh%0A
%0A
Perkenalkan, saya ${item.nama_pendaftar} 
selaku perwakilan kegiatan ${item.nama_kegiatan}.%0A
Izin mengajukan permohonan verifikasi ${item.jenis_verif} ${item.nama_kegiatan} 
dengan ${item.verif_dengan} pada hari ${common.convert_date_string_to_text(item.tanggal_verif)} 
pukul ${item.jam_verif} WIB.%0A
%0A
Terima kasih atas perhatiannya 🙏🏻%0A
%0A
Wassalamu'alaikum warahmatullahi wabarakatuh%0A
%0A`
})()
