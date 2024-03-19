(() => {
    const url_params = new URLSearchParams(window.location.search)
    const item: DaftarVerifProps = {
        nama_pendaftar: url_params.get('nama_pendaftar') || '',
        organisasi: url_params.get('organisasi') || '',
        nama_kegiatan: url_params.get('nama_kegiatan') || '',
        deskripsi_kegiatan: url_params.get('deskripsi_kegiatan') || '',
        jenis_kegiatan: url_params.get('jenis_kegiatan') || '',
        jenis_verif: url_params.get('jenis_verif') || '',
        verif_dengan: url_params.get('verif_dengan') || '',
        tanggal_verif: url_params.get('tanggal_verif') || '', // yyyy-mm-dd
        waktu_verif: url_params.get('waktu_verif') || '',
        status: 'QUEUED',
    }

    const mailto = item.verif_dengan === 'LEM' ? G.EMAIL_LEM : G.EMAIL_DPM

    const email_confirmation = document.querySelector('#email_confirmation') as HTMLSpanElement
    email_confirmation.innerText = mailto

    const template_text_p = document.querySelector('#template_text') as HTMLParagraphElement
    const template_text_text = url_params.get('template_text') || ''
    template_text_p.innerHTML = `<strong>"${template_text_text}"</strong>`


    const link_email = document.querySelector('#link_email') as HTMLAnchorElement
    link_email.href = `mailto:${mailto}?subject=${template_text_text}
&body=
Assalamu’alaikum wr. wb.
%0A%0A
Perkenalkan, saya ${item.nama_pendaftar} 
mahasiswa FK UII yang saat ini diamanahi menjadi sekretaris ${item.nama_kegiatan}. 
Kami bermaksud mengajukan permohonan verifikasi ${item.jenis_verif} 
kegiatan ${item.nama_kegiatan} dengan ${item.verif_dengan} pada tanggal ${item.tanggal_verif}. 
Terima kasih.
%0A%0A
Wassalamu’alaikum wr. wb.
%0A%0A`
})()
