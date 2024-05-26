(() => {
    const card_container = dom.q<'div'>('#card_container')!

    let count = 0
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

    const div_loading = dom.c('div', {
        classes: ['d-flex', 'align-items-center'],
        html: `
            <strong role="status" class="text-secondary fst-italic">Memuat...</strong>
            <div class="spinner-border ms-auto" aria-hidden="true"></div>
        `
    })

    card_container.parentElement!.insertBefore(div_loading, card_container)

    events.on('sistem_data_organisasi_loaded', ev => {
        for (const org of ev) {
            add_org_card(
                org.nama,
                org.color,
                org.title,
                org.profil,
                org.keunggulan,
                org.link,
            )
        }

        main.invoke_animation()
        card_container.parentElement!.removeChild(div_loading)
    })
})()
