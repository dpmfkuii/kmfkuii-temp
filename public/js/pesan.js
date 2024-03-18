"use strict";
var form = document.querySelector('form');
var input_nama_kegiatan = document.querySelector('#input_nama_kegiatan');
var submit_button = document.querySelector('#input_submit_button');
var get_radio_input_value = function (name) {
    var value = '';
    var input = document.querySelectorAll("input[name=\"".concat(name, "\"]"));
    input.forEach(function (n) {
        if (n.checked)
            value = n.value;
    });
    return value;
};
var get_jenis_verif = function () { return get_radio_input_value('jenis_verif'); };
var get_verif_dengan = function () { return get_radio_input_value('verif_dengan'); };
var loop = function () {
    submit_button.innerHTML = "<strong>PESAN VERIF</strong> ".concat(get_jenis_verif()).concat(input_nama_kegiatan.value ? '_' : '').concat(input_nama_kegiatan.value, " dengan ").concat(get_verif_dengan());
    window.requestAnimationFrame(loop);
};
window.requestAnimationFrame(loop);
