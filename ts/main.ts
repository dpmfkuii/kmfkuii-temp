declare const firebase: any
declare const QRCode: any

type StatusPesanVerif = 'QUEUED' | 'CONFIRMED'

type PesanVerifProps = {
    nama_pemesan: string
    organisasi: string
    nama_kegiatan: string
    deskripsi_kegiatan: string
    jenis_verif: string
    verif_dengan: string
    tanggal_verif: string
    waktu_verif: string
    status: StatusPesanVerif
}

const pesan_db = firebase.database().ref("/pesan")

// maindb.on('value', (snapshot: any) => {
//     console.log(snapshot.val())
// })

// const msginput = document.querySelector('input')!
// msginput.onchange = () => {
//     maindb.set(msginput.value)
// }

const resize_iframe = () => {
    try {
        const iframe_width_reference = document.querySelector('#iframe_width_reference') as HTMLDivElement
        document.querySelector('iframe')?.setAttribute('width', `${iframe_width_reference.clientWidth + 46}`)
    }
    catch { }
}
window.addEventListener('resize', () => resize_iframe())
resize_iframe()

document.addEventListener('DOMContentLoaded', () => {
    const list_antrian_items = document.querySelector('#list-antrian-items') as HTMLDivElement
    if (list_antrian_items !== null) {
        pesan_db.on('value', (snapshot: any) => {
            const val = snapshot.val()
            if (val) {
                list_antrian_items.innerHTML = ''
                for (const key in val) {
                    const item = val[key] as PesanVerifProps

                    if (item.status === 'QUEUED') {
                        const li = document.createElement('li')
                        const c = {
                            PRESIDIUM: 'primary',
                            LEM: 'warning',
                            DPM: 'info',
                        }[item.verif_dengan]
                        li.innerHTML = `[${item.tanggal_verif} at ${item.waktu_verif}]
                        <span class="badge text-bg-${c}">${item.verif_dengan}</span> ${item.jenis_verif}_${item.nama_kegiatan}`

                        list_antrian_items.appendChild(li)
                    }
                }
            }
        })
    }
})
