(async () => {
    const list_antrean_items = dom.q<'ol'>('#list_antrean_items')!
    const jadwal_verif_antrean_badge = dom.q<'span'>('#jadwal_verif_antrean_badge')!

    db.get_antrean_rapat()
        .then(snap => {
            if (!snap.exists()) return

            const antrean = snap.val()
            list_antrean_items.innerHTML = ''
            let antrean_count = 0
            console.log(antrean)
            for (const rapat_dengan in antrean) {
                for (const timestamp in antrean[rapat_dengan]) {
                    const rapat: Rapat = antrean[rapat_dengan][timestamp]
                    const li = document.createElement("li");
                    li.classList.add("mb-2");

                    li.innerHTML = `
                        <strong>
                            ${common.convert_date_string_to_text(rapat.tanggal_rapat)}
                        </strong> <span class="text-primary">${rapat.jam_rapat} WIB</span>
                        <div>
                            <small>
                                <span class="badge text-bg-primary"${rapat_dengan}</span>
                                ${rapat.jenis_rapat}_${rapat.uid}
                            </small>
                        </div>
                    `

                    list_antrean_items.appendChild(li)
                    antrean_count++
                }

            }
            if (jadwal_verif_antrean_badge !== null) {
                jadwal_verif_antrean_badge.textContent = antrean_count.toString()
            }
            if (antrean_count === 0) {
                list_antrean_items.innerHTML = '<i class="text-secondary">Tidak ada antrean.</i>'
            }

        })
})()
