declare const firebase: any
declare const QRCode: any

type StatusVerif = 'QUEUED' | 'CONFIRMED'

type DaftarVerifProps = {
    nama_pendaftar: string
    organisasi: string
    nama_kegiatan: string
    deskripsi_kegiatan: string
    jenis_verif: string
    verif_dengan: string
    tanggal_verif: string
    waktu_verif: string
    status: StatusVerif
}

const db_daftar_verif = firebase.database().ref("/pesan")

// maindb.on('value', (snapshot: any) => {
//     console.log(snapshot.val())
// })

// const msginput = document.querySelector('input')!
// msginput.onchange = () => {
//     maindb.set(msginput.value)
// }

document.addEventListener('DOMContentLoaded', () => {
    const list_antrean_items = document.querySelector('#list-antrean-items') as HTMLDivElement
    const jadwal_verif_antrean_badge = document.querySelector('#jadwal-verif-antrean-badge') as HTMLSpanElement
    if (list_antrean_items !== null) {
        db_daftar_verif.on('value', (snapshot: any) => {
            const val = snapshot.val()
            if (val) {
                list_antrean_items.innerHTML = ''
                let antrean_count = 0
                for (const key in val) {
                    const item = val[key] as DaftarVerifProps

                    if (item.status === 'QUEUED') {
                        const li = document.createElement('li')
                        const c = {
                            PRESIDIUM: 'primary',
                            LEM: 'warning',
                            DPM: 'info',
                        }[item.verif_dengan]
                        li.innerHTML = `[${item.tanggal_verif} at ${item.waktu_verif}]
                        <span class="badge text-bg-${c}">${item.verif_dengan}</span> ${item.jenis_verif}_${item.nama_kegiatan}`

                        list_antrean_items.appendChild(li)

                        antrean_count++
                    }
                }

                if (jadwal_verif_antrean_badge !== null) {
                    jadwal_verif_antrean_badge.innerText = antrean_count.toString()
                }

                if (antrean_count === 0) {
                    list_antrean_items.innerHTML = '<i class="text-secondary">Tidak ada antrean.</i>'
                }
            }
        })
    }
})
