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

            // db.ref(`verifikasi/kegiatan/logs/${uid}`)
            "logs": {
                "{uid}": {
                    "{timestamp}": "@success Pendaftaran berhasil.",
                    "{timestamp}": "@info Pembaruan data kegiatan.",
                    "{timestamp}": "@info Penjadwalan rapat verifikasi proposal ke DPM dalam antrean.",
                    "{timestamp}": "@success Penjadwalan rapat verifikasi proposal ke DPM terkonfirmasi.",
                    "{timestamp}": "@success Verifikasi proposal ke DPM diterima dengan revisi.",
                    "{timestamp}": "@info Revisi proposal ke DPM #1 terkirim.",
                    "{timestamp}": "@info Revisi proposal ke DPM #1 diterima dengan revisi kembali.",
                    "{timestamp}": "@info Revisi proposal ke DPM #2 terkirim.",
                    "{timestamp}": "@success @html Verifikasi proposal ke DPM <strong>selesai</strong>.",
                    "{timestamp}": "@info Dana rkat telah cair.",
                    "{timestamp}": "@info Penjadwalan rapat verifikasi lpj ke LEM dalam antrean.",
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
                    "{timestamp}": {
                        "uid": "abc123",
                        "jenis_verifikasi": "proposal",
                        "tanggal_rapat": "31-01-2024",
                        "jam_rapat": "16.00",
                    },
                },
                "dpm": {
                    "{timestamp}": {
                        "uid": "abc123",
                        "jenis_verifikasi": "lpj",
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
                                    "jenis_verifikasi": "proposal",
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
                                    "jenis_verifikasi": "lpj",
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
                                    "jenis_verifikasi": "lpj",
                                    "tanggal_rapat": "18-01-2025",
                                    "jam_rapat": "16.00",
                                }
                            },
                        },
                    },
                },
            },
        },
    },
}
