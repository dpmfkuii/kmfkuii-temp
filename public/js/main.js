"use strict";
var pesan_db = firebase.database().ref("/pesan");
var resize_iframe = function () {
    var _a;
    try {
        var iframe_width_reference = document.querySelector('#iframe_width_reference');
        (_a = document.querySelector('iframe')) === null || _a === void 0 ? void 0 : _a.setAttribute('width', "".concat(iframe_width_reference.clientWidth + 46));
    }
    catch (_b) { }
};
window.addEventListener('resize', function () { return resize_iframe(); });
resize_iframe();
document.addEventListener('DOMContentLoaded', function () {
    var list_antrian_items = document.querySelector('#list-antrian-items');
    if (list_antrian_items !== null) {
        pesan_db.on('value', function (snapshot) {
            var val = snapshot.val();
            if (val) {
                list_antrian_items.innerHTML = '';
                for (var key in val) {
                    var item = val[key];
                    if (item.status === 'QUEUED') {
                        var li = document.createElement('li');
                        var c = {
                            PRESIDIUM: 'primary',
                            LEM: 'warning',
                            DPM: 'info',
                        }[item.verif_dengan];
                        li.innerHTML = "[".concat(item.tanggal_verif, " at ").concat(item.waktu_verif, "]\n                        <span class=\"badge text-bg-").concat(c, "\">").concat(item.verif_dengan, "</span> ").concat(item.jenis_verif, "_").concat(item.nama_kegiatan);
                        list_antrian_items.appendChild(li);
                    }
                }
            }
        });
    }
});
