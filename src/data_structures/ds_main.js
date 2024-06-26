var _ = {
    // db.ref('users')
    "users": {
        // db.ref(`users/${uid}`)
        "{uid}": {
            "uid": "abc123",
            "role": "guest",
        },
    },

    "verifikasi": {
        // db.ref('verifikasi/kegiatan')
        "kegiatan": {
            // db.ref(`verifikasi/kegiatan/${uid}`)
            "{uid}": {
                "uid": "abc123",
                "email_pendaftar": "me@tailung.com",
                "nama_pendaftar": "Tai Lung",
                "organisasi_index": 1,
                "nama_kegiatan": "Konferensi ITAF 2024",
                "periode_kegiatan": "2023/2024",
                "penyelenggara_kegiatan_index": 0,
                "lingkup_kegiatan_index": 3,
                "tanggal_kegiatan": [
                    "14-03-2024",
                    "21-03-2024",
                ],
                "status": {
                    "diajukan": 1234567890,
                    "verifikasi": {
                        "proposal": {
                            "lem": 1234567890, // -1 not started, 0 = in progress, timestamp = done
                            "dpm": 1234567890,
                        },
                        "lpj": {
                            "lem": -1,
                            "dpm": -1,
                        },
                    },
                },
                "created_timestamp": 1234567890,
                "updated_timestamp": 1234567890,
            },

            "logs": {
                // db.ref(`verifikasi/kegiatan/logs/${uid}`)
                "{uid}": {
                    "{timestamp}": "@light Akun berhasil dibuat.",
                    "{timestamp}": "@info Pembaruan data kegiatan.",
                    "{timestamp}": "@info Penjadwalan rapat verifikasi proposal dengan DPM dalam antrean.",
                    "{timestamp}": "@success Penjadwalan rapat verifikasi proposal dengan DPM terkonfirmasi.",
                    "{timestamp}": "@success Verifikasi proposal dengan DPM diterima dengan revisi.",
                    "{timestamp}": "@info Revisi proposal dengan DPM #1 terkirim.",
                    "{timestamp}": "@info Revisi proposal dengan DPM #1 diterima dengan revisi kembali.",
                    "{timestamp}": "@info Revisi proposal dengan DPM #2 terkirim.",
                    "{timestamp}": "@success @html Verifikasi proposal dengan DPM <strong>selesai</strong>.",
                    "{timestamp}": "@info Dana rkat telah cair.",
                    "{timestamp}": "@info Penjadwalan rapat verifikasi LPJ dengan LEM dalam antrean.",
                },
            },

            // db.ref('verifikasi/kegiatan/logbook')
            "logbook": {
                "2023-2024": {
                    "{organisasi_index}": {
                        // db.ref(`verifikasi/kegiatan/logbook/2023-2024/${organisasi_index}/${uid}`)
                        "{uid}": "Konferensi ITAF 2024@proposal_lem@proposal_dpm@lpj_lem@lpj_dpm:p",
                    },
                }
            },
        },

        "rapat": {
            // db.ref('verifikasi/rapat/antrean')
            "antrean": {
                // db.ref('verifikasi/rapat/antrean/lem')
                "lem": {
                    "{tanggal_rapat+jam_rapat}": {
                        "t": 1234567890,
                        "uid": "abc123",
                        "nama_kegiatan": "Konferensi ITAF 2024",
                        "jenis_rapat": "proposal",
                        "rapat_dengan": "lem",
                        "tanggal_rapat": "31-01-2024",
                        "jam_rapat": "16.00",
                    },
                },
                "dpm": {
                    "{tanggal_rapat+jam_rapat}": {
                        "t": 1234567890,
                        "uid": "abc123",
                        "nama_kegiatan": "Konferensi ITAF 2024",
                        "jenis_rapat": "lpj",
                        "rapat_dengan": "dpm",
                        "tanggal_rapat": "02-04-2024",
                        "jam_rapat": "20.00",
                    },
                },
            },

            // db.ref('verifikasi/rapat/jadwal')
            "jadwal": {
                "lem": {
                    "2024": {
                        "04": {
                            // db.ref('verifikasi/rapat/jadwal/lem/2024/04/29')
                            "29": {
                                "{timestamp}": {
                                    "uid": "abc123",
                                    "nama_kegiatan": "Konferensi ITAF 2024",
                                    "jenis_rapat": "proposal",
                                    "rapat_dengan": "lem",
                                    "tanggal_rapat": "29-04-2024",
                                    "jam_rapat": "20.00",
                                }
                            },
                        },
                        // db.ref('verifikasi/rapat/jadwal/lem/2024/05')
                        "05": {
                            "22": {
                                "{timestamp}": {
                                    "uid": "def456",
                                    "nama_kegiatan": "Konferensi ITAF 2024",
                                    "jenis_rapat": "lpj",
                                    "rapat_dengan": "lem",
                                    "tanggal_rapat": "22-05-2024",
                                    "jam_rapat": "16.00",
                                }
                            },
                        },
                    },
                },
                "dpm": {
                    "2025": {
                        // db.ref('verifikasi/rapat/jadwal/dpm/2025/01')
                        "01": {
                            "18": {
                                "{timestamp}": {
                                    "uid": "def456",
                                    "nama_kegiatan": "Konferensi ITAF 2024",
                                    "jenis_rapat": "lpj",
                                    "rapat_dengan": "dpm",
                                    "tanggal_rapat": "18-01-2025",
                                    "jam_rapat": "16.00",
                                }
                            },
                        },
                    },
                },
            },

            "pengajuan": {
                "{uid}": {
                    "proposal": {
                        "lem": {
                            // main_db.ref(`verifikasi/rapat/pengajuan/${uid}/${jenis}/${dengan}/diajukan`)
                            "diajukan": 1234567890,
                            // main_db.ref(`verifikasi/rapat/pengajuan/${uid}/${jenis}/${dengan}/diterima`)
                            "diterima": 1234567890,
                        },
                        "dpm": {
                            "diajukan": 1234567890,
                            "diterima": 1234567890,
                        },
                    },
                    "lpj": {
                        "lem": {
                            "diajukan": 1234567890,
                            "diterima": 1234567890,
                        },
                        "dpm": {
                            "diajukan": 1234567890,
                            "diterima": 1234567890,
                        },
                    },
                },
            },
        },

        // db.ref('verifikasi/keuangan')
        "keuangan": {
            // db.ref('verifikasi/keuangan/fincard')
            "fincard": {
                // db.ref(`verifikasi/keuangan/fincard/${periode}`)
                "2023-2024": {
                    // db.ref(`verifikasi/keuangan/fincard/${periode}/${organisasi_index}`)
                    "{organisasi_index}": {
                        // db.ref(`verifikasi/keuangan/fincard/${periode}/${organisasi_index}/${uid}`)
                        "{uid}": {
                            "nama_kegiatan": "Konferensi", // make sure any instances where the main `nama_kegiatan` is changed this gets changed as well
                            "tahun_rkat": 2024,
                            "sub_aktivitas_rkat_index": 0,
                            "rkat_murni": 7000000,
                            "rkat_alokasi": {
                                "{dari_uid}": 60000,
                            },
                            "dpm": 500000,
                            "sisa": 50000,
                            "sudah_kembali": true,
                            "disimpan_dpm": 0,
                            "alokasi": {
                                "{untuk_uid}": 50000,
                            },
                            "status_lpj": -1, // updating status should not update timestamp, just update the status
                            "updated_timestamp": 1234567890,
                        },
                    },
                },
            },
            // db.ref(`verifikasi/keuangan/fintime`)
            "fintime": {
                // db.ref(`verifikasi/keuangan/fintime/${uid}`)
                "{uid}": {
                    "{last_updated_timestamp}": {
                        "datetime": "YYYY-MM-DDThh:mm",
                        "tipe_index": 0,
                        "icon_index": 0,
                        "color_index": 0,
                        "judul": "Perubahan pengajuan dana",
                        "transaksi": [
                            "RKAT:4000000",
                            "DPM:500000",
                        ],
                        "keterangan": "",
                    },
                },
            },
            // db.ref(`verifikasi/keuangan/firaa`)
            "firaa": {
                // db.ref(`verifikasi/keuangan/firaa/${tahun_rkat}`)
                "{tahun_rkat}": {
                    // db.ref(`verifikasi/keuangan/firaa/${tahun_rkat}/${organisasi_index}`)
                    "{organisasi_index}": {
                        idealita: 30000000,
                        realita: 20000000,
                    },
                },
            },
        },
    },

    // db.ref(`sistem`)
    "sistem": {
        // db.ref(`sistem/data`)
        "data": {
            // db.ref(`sistem/data/verifikasi`) => SistemData.Verifikasi
            "verifikasi": {
                "link_berkas": {
                    "lem": "drivelink",
                    "dpm": "drivelink",
                },
                "jam_rapat": {
                    "opsi": ["16.00", "", ""],
                    "jam_reschedule_lem": ["16.00", ""],
                    "jam_reschedule_dpm": ["16.00", ""],
                },
                "komunikasi": {
                    "ig_lem": "lem",
                    "ig_dpm": "dpm",
                    "line_lem": "lineid",
                    "email_lem": "lem@gmail.com",
                    "email_dpm": "dpm@gmail.com",
                    "email_kemahasiswaan": "kemahasiswaan@gmail.com",
                },
                "tahun_periode": {
                    "saat_ini": 2024,
                    "tertua": 2024,
                },
            },
            // db.ref(`sistem/data/keuangan`) => SistemData.Keuangan
            "keuangan": {
                // db.ref(`sistem/data/keuangan/sub_aktivitas_rkat`) => SistemData.Keuangan['sub_aktivitas_rkat']
                "sub_aktivitas_rkat": {
                    // db.ref(`sistem/data/keuangan/sub_aktivitas_rkat/${tahun_rkat}`) => { [kode_rkat: string]: SubAktivitasRKAT }
                    "2024": [
                        {
                            kode: "03",
                            nama: "Kegiatan Lembaga Mahasiswa (Lembaga dan UKM)",
                            anggaran: 500000000,
                        },
                        {
                            kode: "06",
                            nama: "Delegasi Lomba Non-Akademik",
                            anggaran: 40000000,
                        },
                        {
                            kode: "07",
                            nama: "Delegasi Lomba Akademik",
                            anggaran: 220000000,
                        },
                        {
                            kode: "08",
                            nama: "Delegasi Non Lomba Nasional/Internasional",
                            anggaran: 99000000,
                        },
                    ]
                },
            },
            // db.ref(`sistem/data/organisasi`) => SistemData.Organisasi[]
            "organisasi": [
                {
                    "nama": "DPM",
                    "color": "text-bg-light",
                    "title": "[ DPM FK UII ]<br /><small>Dewan Perwakilan Mahasiswa FK UII</small>",
                    "profil": "Profil DPM belum diisi.",
                    "keunggulan": "Keunggulan DPM belum diisi.",
                    "link": "https://www.instagram.com/dpmfkuii",
                },
            ],
            // db.ref(`sistem/data/panduan`)
            "panduan": {
                "alur": {
                    "informasi_terbaru": "html",
                },
            },
        },
        // db.ref(`sistem/plugin`)
        "plugin in the future???": {},
        // db.ref(`sistem/resources`)
        "resource manager in the future???": {},
    },
}

// reset all fincard
// db.get_logbook().then(snap => {
//     const a = snap.val()
//     for (const b of Object.values(a)) {
//         for (const c of Object.values(b)) {
//             for (const uid in c) {
//                 db.get_kegiatan(uid).then(async snap => {
//                     if (snap.exists()) {
//                         const kegiatan = snap.val()
//                         db.keuangan.fincard.set(kegiatan.periode_kegiatan, kegiatan.organisasi_index, kegiatan.uid, {
//                             nama_kegiatan: kegiatan.nama_kegiatan,
//                             tahun_rkat: new Date().getFullYear(),
//                             sub_aktivitas_rkat_index: -1,
//                             rkat_murni: 0,
//                             rkat_alokasi: {},
//                             dpm: 0,
//                             sisa: 0,
//                             sudah_kembali: false,
//                             disimpan_dpm: 0,
//                             alokasi: {},
//                             status_lpj: kegiatan.status.verifikasi.lpj.dpm,
//                             updated_timestamp: kegiatan.created_timestamp,
//                         })
//                     }
//                 })
//             }
//         }
//     }
// })
