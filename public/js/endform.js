"use strict";
var template_text_p = document.querySelector('#template_text');
var template_text_param = new URLSearchParams(window.location.search).get('template_text') || '';
template_text_p.innerHTML = "TEMPLATE TEXT: <strong>\"".concat(template_text_param, "\"</strong>");
var link_wa = document.querySelector('#link_wa');
link_wa.href = "https://wa.me/6282186647658?text=".concat(window.encodeURI(template_text_param));
