"use strict";
var url_params = new URLSearchParams(window.location.search);
var form_values = {
    nama_pemesan: url_params.get('nama_pemesan') || '',
    organisasi: url_params.get('organisasi') || '',
    nama_kegiatan: url_params.get('nama_kegiatan') || '',
    deskripsi_kegiatan: url_params.get('deskripsi_kegiatan') || '',
    jenis_verif: url_params.get('jenis_verif') || '',
    verif_dengan: url_params.get('verif_dengan') || '',
    tanggal_verif: url_params.get('tanggal_verif') || '',
    waktu_verif: url_params.get('waktu_verif') || '',
    status: 'QUEUED',
};
pesan_db.push(form_values)
    .then(function () {
    window.location.replace("./endform.html?template_text=".concat(template_text));
});
var template_text = "SUDAH PESAN VERIF ".concat(form_values.jenis_verif, "_").concat(form_values.nama_kegiatan, " dengan ").concat(form_values.verif_dengan, " [").concat(form_values.tanggal_verif, " at ").concat(form_values.waktu_verif, "]");
