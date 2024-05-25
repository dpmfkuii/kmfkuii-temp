(() => {
    let count = 0

    const card_container = dom.q<'div'>('#card_container')!

    const add_org_card = (tab_name: string, color_class: string, title: string, profil_text: string, keunggulan_text: string, href: string) => {
        const tab_profil_value = `${tab_name}_profil`
        const tab_keunggulan_value = `${tab_name}_keunggulan`
        const card = dom.c('div', {
            classes: ['card', 'h-100', 'shadow-sm', 'border'],
            html: `
                <div class="card-header ${color_class} bg-gradient text-center p-3">
                    <span class="fs-6">${title}</span>
                </div>
                <div class="card-body">
                    <div class="row g-1">
                        <div class="col d-grid p-1 mt-0">
                            <input type="radio" name="${tab_name}" value="${tab_profil_value}" class="btn-check" id="${tab_name}_radio_profil" autocomplete="off" checked="">
                            <label class="btn btn-outline-primary btn-sm rounded-pill d-flex align-items-center" for="${tab_name}_radio_profil">
                                <i class="fa-solid fa-circle-info"></i>
                                <span class="flex-fill">Profil</span>
                            </label>
                        </div>
                        <div class="col d-grid p-1 mt-0">
                            <input type="radio" name="${tab_name}" value="${tab_keunggulan_value}" class="btn-check" id="${tab_name}_radio_keunggulan" autocomplete="off">
                            <label class="btn btn-outline-success btn-sm rounded-pill d-flex align-items-center" for="${tab_name}_radio_keunggulan">
                                <i class="fa-solid fa-star"></i>
                                <span class="flex-fill">Keunggulan</span>
                            </label>
                        </div>
                    </div>
                    <p class="card-text small p-2 m-0">${profil_text}</p>
                </div>
                <div class="card-footer bg-white">
                    <div class="d-grid small">
                        <a role="button" href="${href}" class="btn btn-outline-dark btn-sm" target="_blank">
                            INFORMASI LEBIH LANJUT
                            <i class="fa-solid fa-arrow-up-right-from-square"></i>
                        </a>
                    </div>
                </div>
            `
        })

        const p = dom.qe<'p'>(card, '.card-body p')!

        dom.qea<'input'>(card, 'input').forEach(input => {
            input.addEventListener('change', () => {
                if (input.value === tab_profil_value) {
                    p.innerHTML = profil_text
                }
                else if (input.value === tab_keunggulan_value) {
                    p.innerHTML = keunggulan_text
                }
            })
        })

        const card_wrapper = dom.c('div', { classes: ['col', 'mb-4', 'animate', 'animate-rise-on-enter'], children: [card] })
        card_wrapper.style.transitionDelay = `${count * 100}ms`
        card_container.appendChild(card_wrapper)
        count++
    }

    add_org_card(
        OrganisasiKegiatan.LEM,
        `text-bg-km-primary`,
        `[ LEM FK UII ]<br /><small>Lembaga Eksekutif Mahasiswa FK UII</small>`,
        `Profil LEM belum diisi.`,
        `Keunggulan LEM belum diisi.`,
        `https://www.instagram.com/lem_fkuii`,
    )

    add_org_card(
        OrganisasiKegiatan.LPM_CARDIOS,
        `text-bg-lpm-cardios`,
        `[ LPM FK UII ]<br /><small>Lembaga Pers Mahasiswa FK UII</small>`,
        `Profil LPM belum diisi.`,
        `Keunggulan LPM belum diisi.`,
        `https://www.instagram.com/lpmcardios/`,
    )

    add_org_card(
        OrganisasiKegiatan.CMIA,
        `text-bg-cmia`,
        `[ CMIA FK UII ]<br /><small>Center for Medical Islamic Activities FK UII</small>`,
        `Profil CMIA belum diisi.`,
        `Keunggulan CMIA belum diisi.`,
        `https://www.instagram.com/cmiafkuii/`,
    )

    add_org_card(
        OrganisasiKegiatan.TBMM_HUMERUS,
        `text-bg-tbmm-humerus`,
        `[ TBMM Humerus FK UII ]<br /><small>Tim Bantuan Medis Mahasiswa Humanity Mission in Medical Rescue FK UII</small>`,
        `Profil TBMM Humerus belum diisi.`,
        `Keunggulan TBMM Humerus belum diisi.`,
        `https://www.instagram.com/tbmmhumerus/`,
    )

    add_org_card(
        OrganisasiKegiatan.SMART,
        `text-bg-smart`,
        `[ SMART FK UII ]<br /><small>Scientific Medical Activities of Research and Technology FK UII</small>`,
        `Profil SMART belum diisi.`,
        `Keunggulan SMART belum diisi.`,
        `https://www.instagram.com/smartfkuii/`,
    )

    add_org_card(
        OrganisasiKegiatan.CIMSA,
        `text-bg-cimsa`,
        `[ CIMSA FK UII ]<br /><small>Center for Indonesian Medical Students’ Activities FK UII</small>`,
        `Profil CIMSA belum diisi.`,
        `Keunggulan CIMSA belum diisi.`,
        `https://www.instagram.com/cimsa.uii/`,
    )

    add_org_card(
        OrganisasiKegiatan.MEDICAL_UII_FC,
        `text-bg-km-primary`,
        `[ Medical UII FC ]<br /><small>UKM Bola FK UII</small>`,
        `Profil Medical UII FC belum diisi.`,
        `Keunggulan Medical UII FC belum diisi.`,
        `https://www.instagram.com/medicaluiifc/`,
    )

    add_org_card(
        OrganisasiKegiatan.BASKET,
        `text-bg-km-primary`,
        `[ Basket FK UII ]<br /><small>UKM Basket FK UII</small>`,
        `Profil Basket FK UII belum diisi.`,
        `Keunggulan Basket FK UII belum diisi.`,
        `https://www.instagram.com/basketfkuii/`,
    )

    add_org_card(
        OrganisasiKegiatan.DARA_MEUTUWAH,
        `text-bg-km-primary`,
        `[ Dara Meutuwah FK UII ]<br /><small>UKM Tari FK UII</small>`,
        `Profil Dara Meutuwah FK UII belum diisi.`,
        `Keunggulan Dara Meutuwah FK UII belum diisi.`,
        `https://www.instagram.com/tarifkuii/`,
    )

    add_org_card(
        OrganisasiKegiatan.BADMINTON,
        `text-bg-km-primary`,
        `[ Badminton FK UII ]<br /><small>UKM Badminton FK UII</small>`,
        `Profil Badminton FK UII belum diisi.`,
        `Keunggulan Badminton FK UII belum diisi.`,
        `https://www.instagram.com/badmintonfkuii/`,
    )

    add_org_card(
        OrganisasiKegiatan.NADA_MEDIKA,
        `text-bg-km-primary`,
        `[ Nada Medika FK UII ]<br /><small>UKM Musik FK UII</small>`,
        `Profil Nada Medika FK UII belum diisi.`,
        `Keunggulan Nada Medika FK UII belum diisi.`,
        `https://www.instagram.com/nadamedikafkuii/`,
    )
})()
