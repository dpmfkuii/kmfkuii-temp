namespace Fincard {
    export enum Mode {
        SINGLE = 'Single',
        MULTI = 'Multi',
    }
    export enum Rating {
        SAPPHIRE = 'Sapphire',
        RUBY = 'Ruby',
        EMERALD = 'Emerald',
    }
    export const RatingClass = {
        [Rating.SAPPHIRE]: 'fincard-sapphire',
        [Rating.RUBY]: 'fincard-ruby',
        [Rating.EMERALD]: 'fincard-emerald',
    }
    export class Card {
        mode: Mode
        rating: Rating
        is_flipped: boolean = false
        el: {
            flip_card: {
                el: HTMLDivElement
                inner: HTMLDivElement
                front: HTMLDivElement
                back: HTMLDivElement
            }
            fincard: {
                front: {
                    el: HTMLDivElement
                    header: {
                        el: HTMLDivElement
                        title: HTMLSpanElement
                    }
                    body: {
                        el: HTMLDivElement
                        out: HTMLSpanElement
                        rating: HTMLSpanElement
                        in: HTMLSpanElement
                        left: HTMLSpanElement
                        rkat: HTMLSpanElement
                        lpj: HTMLSpanElement
                    }
                    footer: {
                        el: HTMLDivElement
                        more_button: HTMLDivElement
                        flip_button: HTMLDivElement
                    }
                }
                back: {
                    el: HTMLDivElement
                    body: {
                        el: HTMLDivElement
                        out_rkat: HTMLSpanElement
                        out_dpm: HTMLSpanElement
                        in_dpm: HTMLSpanElement
                        in_alokasi: HTMLSpanElement
                        out_alokasi: HTMLSpanElement
                        left: HTMLSpanElement
                        updated: HTMLSpanElement
                    }
                    footer: {
                        el: HTMLDivElement
                        more_button: HTMLDivElement
                        flip_button: HTMLDivElement
                    }
                }
            }
        }
        constructor(mode: Mode = Mode.SINGLE, rating: Rating = Rating.SAPPHIRE) {
            const bb = (b: string) => dom.c('div', { classes: ['col', 'd-grid', 'px-0', 'py-2'], attributes: { role: 'button' }, html: `<i class="fa-solid fa-${b}"></i>` }) // footer button
            const tt = (t: string) => `data-bs-toggle="tooltip" data-bs-title="${t}"` // tooltip
            const p = dom.c('span') // placeholder

            this.mode = mode
            this.rating = rating

            //#region  Fincard init elements
            this.el = {
                flip_card: {
                    el: dom.c('div', { classes: ['fincard-flip-card'] }),
                    inner: dom.c('div', { classes: ['fincard-flip-card-inner'] }),
                    front: dom.c('div', { classes: ['fincard-flip-card-front'] }),
                    back: dom.c('div', { classes: ['fincard-flip-card-back'] }),
                },
                fincard: {
                    front: {
                        el: dom.c('div', { classes: ['fincard', 'fincard-sapphire', 'fincard-shine'] }),
                        header: {
                            el: dom.c('div', { classes: ['fincard-header'] }),
                            title: dom.c('span', { classes: ['fincard-title', 'flex-grow-1', 'pe-2', 'text-truncate'], text: '-' }),
                        },
                        body: {
                            el: dom.c('div', { classes: ['fincard-body', 'pt-0'] }),
                            out: p,
                            rating: p,
                            in: p,
                            left: p,
                            rkat: p,
                            lpj: p,
                        },
                        footer: {
                            el: dom.c('div', { classes: ['fincard-footer'] }),
                            more_button: bb('bars'),
                            flip_button: bb('reply'),
                        },
                    },
                    back: {
                        el: dom.c('div', { classes: ['fincard', 'fincard-sapphire', 'fincard-shine'] }),
                        body: {
                            el: dom.c('div', { classes: ['fincard-body'] }),
                            out_rkat: p,
                            out_dpm: p,
                            in_dpm: p,
                            in_alokasi: p,
                            out_alokasi: p,
                            left: p,
                            updated: p,
                        },
                        footer: {
                            el: dom.c('div', { classes: ['fincard-footer'] }),
                            more_button: bb('bars'),
                            flip_button: bb('share'),
                        },
                    },
                },
            }

            // Fincard front elements
            this.el.fincard.front.header.el.appendChild(dom.c('div', {
                classes: ['d-flex', 'align-items-center', 'px-3'],
                children: [
                    this.el.fincard.front.header.title,
                    dom.c('div', { classes: ['fincard-vica'], text: 'VICA' }),
                ],
            }))
            this.el.fincard.front.body.el.innerHTML = `<table class="table table-borderless"><tbody>
<tr>
    <th scope="col" class="fw-normal label"><span ${tt('Pengeluaran')}>Out</span></th>
    <th scope="col" class="fw-normal label"><span ${tt('Rating Fincard')}>Rating</span></th>
</tr>
<tr>
    <td><span class="fincard-out-text">-</span></td>
    <td><span class="fincard-rating-text">-</span></td>
</tr>
<tr>
    <th scope="col" class="fw-normal label"><span ${tt('Pemasukan')}>In</span></th>
    <th scope="col" class="fw-normal label"><span ${tt('Sisa tersedia')}>Left</span></th>
</tr>
<tr>
    <td><span class="fincard-in-text">-</span></td>
    <td><span class="fincard-left-text">-</span></td>
</tr>
<tr>
    <th scope="col" class="fw-normal label"><span ${tt('Tahun/Sub Aktivitas RKAT')}>RKAT</span></th>
    <th scope="col" class="fw-normal label"><i class="fa-solid fa-check-double label" ${tt('Status verifikasi LPJ DPM')}></i></th>
</tr>
<tr>
    <td><span class="fincard-rkat-text">-</span></td>
    <td><span class="fincard-lpj-text">-</span></td>
</tr></tbody></table>
            `
            this.el.fincard.front.body.out = dom.qe(this.el.fincard.front.body.el, '.fincard-out-text')!
            this.el.fincard.front.body.rating = dom.qe(this.el.fincard.front.body.el, '.fincard-rating-text')!
            this.el.fincard.front.body.in = dom.qe(this.el.fincard.front.body.el, '.fincard-in-text')!
            this.el.fincard.front.body.left = dom.qe(this.el.fincard.front.body.el, '.fincard-left-text')!
            this.el.fincard.front.body.rkat = dom.qe(this.el.fincard.front.body.el, '.fincard-rkat-text')!
            this.el.fincard.front.body.lpj = dom.qe(this.el.fincard.front.body.el, '.fincard-lpj-text')!
            this.el.fincard.front.footer.el.appendChild(dom.c('div', {
                classes: ['row', 'g-1'], children: [
                    this.el.fincard.front.footer.more_button,
                    this.el.fincard.front.footer.flip_button,
                ]
            }))
            this.el.fincard.front.el.appendChild(this.el.fincard.front.header.el)
            this.el.fincard.front.el.appendChild(this.el.fincard.front.body.el)
            this.el.fincard.front.el.appendChild(this.el.fincard.front.footer.el)

            // Fincard back elements
            this.el.fincard.back.body.el.innerHTML = `<table class="back-table table table-borderless"><tbody>
    <tr>
        <th scope="row" class="label">RKAT</th>
        <td ${tt('Keluar RKAT')}>
            <i class="fa-solid fa-circle-right label"></i>
            <span class="fincard-out-rkat-text">-</span>
        </td>
    </tr>
    <tr><td colspan="2"><hr class="my-1" /></td></tr>
    <tr>
        <th scope="row" rowspan="2" class="label">DPM</th>
        <td ${tt('Keluar DPM')}>
            <i class="fa-solid fa-circle-right label"></i>
            <span class="fincard-out-dpm-text">-</span>
        </td>
    </tr>
    <tr>
        <td ${tt('Masuk DPM')}>
            <i class="fa-regular fa-circle-left label"></i>
            <span class="fincard-in-dpm-text">-</span>
        </td>
    </tr>
    <tr><td colspan="2"><hr class="my-1" /></td></tr>
    <tr>
        <th scope="row" rowspan="3" class="label">Alokasi</th>
        <td ${tt('Masuk alokasi')}>
            <i class="fa-regular fa-circle-left label"></i>
            <span class="fincard-in-alokasi-text">-</span>
        </td>
    </tr>
    <tr>
        <td ${tt('Keluar alokasi')}>
            <i class="fa-solid fa-circle-right label"></i>
            <span class="fincard-out-alokasi-text">-</span>
        </td>
    </tr>
    <tr>
        <td ${tt('Sisa tersedia')}>
            <i class="fa-solid fa-equals label"></i>
            <span class="fincard-left-text">-</span>
        </td>
    </tr>
    <tr><td colspan="2"><hr class="my-1" /></td></tr>
    <tr>
        <th scope="row" class="label"><i class="fa-solid fa-clock-rotate-left"></i></th>
        <td>
            <span class="fincard-updated-text">-</span>
        </td>
    </tr></tbody></table>
            `
            this.el.fincard.back.body.out_rkat = dom.qe(this.el.fincard.back.body.el, '.fincard-out-rkat-text')!
            this.el.fincard.back.body.out_dpm = dom.qe(this.el.fincard.back.body.el, '.fincard-out-dpm-text')!
            this.el.fincard.back.body.in_dpm = dom.qe(this.el.fincard.back.body.el, '.fincard-in-dpm-text')!
            this.el.fincard.back.body.in_alokasi = dom.qe(this.el.fincard.back.body.el, '.fincard-in-alokasi-text')!
            this.el.fincard.back.body.out_alokasi = dom.qe(this.el.fincard.back.body.el, '.fincard-out-alokasi-text')!
            this.el.fincard.back.body.left = dom.qe(this.el.fincard.back.body.el, '.fincard-left-text')!
            this.el.fincard.back.body.updated = dom.qe(this.el.fincard.back.body.el, '.fincard-updated-text')!
            this.el.fincard.back.footer.el.appendChild(dom.c('div', {
                classes: ['row', 'g-1'], children: [
                    this.el.fincard.back.footer.more_button,
                    this.el.fincard.back.footer.flip_button,
                ]
            }))
            this.el.fincard.back.el.appendChild(this.el.fincard.back.body.el)
            this.el.fincard.back.el.appendChild(this.el.fincard.back.footer.el)

            // Flip card elements
            this.el.flip_card.front.appendChild(this.el.fincard.front.el)
            this.el.flip_card.back.appendChild(this.el.fincard.back.el)
            this.el.flip_card.inner.appendChild(this.el.flip_card.front)
            this.el.flip_card.inner.appendChild(this.el.flip_card.back)
            this.el.flip_card.el.appendChild(this.el.flip_card.inner)
            //#endregion

            //#region Fincard init logic
            this.el.fincard.front.footer.flip_button.addEventListener('click', () => this.flip())
            this.el.fincard.back.footer.flip_button.addEventListener('click', () => this.flip())
            //#endregion

            this.update_mode()
            this.update_rating()
        }
        flip(): void {
            this.el.flip_card.el.classList.toggle('flipped')
            this.is_flipped = this.el.flip_card.el.classList.contains('flipped')
        }
        flip_to_front(): void {
            if (this.is_flipped) this.flip()
        }
        mount(parent: HTMLElement): void {
            parent.appendChild(this.el.flip_card.el)
            this.start_update_height_on_resize()
            main.init_bs_tooltip()
        }
        get_html_element(): HTMLDivElement {
            return this.el.flip_card.el
        }
        init_more_button(on_click: (ev: MouseEvent) => any): void {
            this.el.fincard.front.footer.more_button.addEventListener('click', ev => on_click(ev))
            this.el.fincard.back.footer.more_button.addEventListener('click', ev => on_click(ev))
        }
        hide_el(el: HTMLElement) {
            el.classList.add('visually-hidden')
        }
        show_el(el: HTMLElement) {
            el.classList.remove('visually-hidden')
        }
        /**
         * 
         * @param options select which to update, all true by default
         */
        update_mode(): void {
            this.update_footer_buttons()
            const lpj_icon = dom.qe<'i'>(this.el.fincard.front.body.el, 'table > tbody > tr:nth-child(5) > th > i')
            switch (this.mode) {
                case Mode.SINGLE:
                    if (lpj_icon) {
                        lpj_icon.classList.add('fa-check')
                        lpj_icon.classList.remove('fa-check-double')
                    }
                    break
                case Mode.MULTI:
                default:
                    if (lpj_icon) {
                        lpj_icon.classList.add('fa-check-double')
                        lpj_icon.classList.remove('fa-check')
                    }
                    break
            }
        }
        update_footer_buttons(mode: Mode = this.mode): void {
            switch (mode) {
                case Mode.SINGLE:
                    this.hide_el(this.el.fincard.front.footer.more_button)
                    this.hide_el(this.el.fincard.back.footer.more_button)
                    break
                case Mode.MULTI:
                default:
                    this.show_el(this.el.fincard.front.footer.more_button)
                    this.show_el(this.el.fincard.back.footer.more_button)
                    break
            }
        }
        update_rating(): void {
            this.el.fincard.front.body.rating.textContent = this.rating
            Object.values(RatingClass).forEach(old_class => {
                this.el.fincard.front.el.classList.remove(old_class)
                this.el.fincard.back.el.classList.remove(old_class)
            })
            const new_class = RatingClass[this.rating]
            this.el.fincard.front.el.classList.add(new_class)
            this.el.fincard.back.el.classList.add(new_class)
        }
        update_height(): void {
            // todo: update front/back body height to match max
            const front_h = this.el.fincard.front.el.getBoundingClientRect().height
            const back_h = this.el.fincard.back.el.getBoundingClientRect().height
            const max_h = Math.max(front_h, back_h)
            this.el.flip_card.el.style.height = `${max_h}px`
        }
        _callback_update_height_on_resize() { }
        start_update_height_on_resize(): void {
            this._callback_update_height_on_resize = () => this.update_height()
            events.on('on_resize', this._callback_update_height_on_resize)
            this.update_height()
        }
        stop_update_height_on_resize(): void {
            events.off('on_resize', this._callback_update_height_on_resize)
        }
        set_title(text: string): void {
            this.el.fincard.front.header.title.textContent = text
            main.set_bs_tooltip(this.el.fincard.front.header.title, text)
        }
        set_front_rkat_text(text: string, tooltip?: string): void {
            this.el.fincard.front.body.rkat.textContent = text
            main.set_bs_tooltip(this.el.fincard.front.body.rkat, tooltip || text)
        }
        set_updated_text(updated_timestamp: number): void {
            const d = new Date(updated_timestamp)
            const m = d.getMonth() + 1
            const mm = m < 10 ? `0${m}` : m
            const yy = `${d.getFullYear()}`.slice(-2)
            this.el.fincard.back.body.updated.textContent = `${mm}/${yy}`
            main.set_bs_tooltip(this.el.fincard.back.body.updated, d.toLocaleString())
        }
        update_data_single(fincard: DatabaseKeuangan.Fincard): void {
            const front_data = main.keuangan.fincard.get_front_card_data_single(fincard)
            const back_data = main.keuangan.fincard.get_back_card_data_single(fincard)
            this.set_title(front_data.title)
            this.el.fincard.front.body.out.textContent = common.format_rupiah_num(front_data.out)
            this.el.fincard.front.body.in.textContent = common.format_rupiah_num(front_data.in)
            this.el.fincard.front.body.left.textContent = common.format_rupiah_num(front_data.left)
            this.set_front_rkat_text(front_data.rkat)
            this.el.fincard.front.body.lpj.textContent = front_data.lpj
            this.el.fincard.back.body.out_rkat.textContent = common.format_rupiah_num(-back_data.out_rkat)
            this.el.fincard.back.body.out_dpm.textContent = common.format_rupiah_num(-back_data.out_dpm)
            this.el.fincard.back.body.in_dpm.textContent = common.format_rupiah_num(back_data.in_dpm, true)
            this.el.fincard.back.body.in_alokasi.textContent = common.format_rupiah_num(back_data.in_alokasi, true)
            this.el.fincard.back.body.out_alokasi.textContent = common.format_rupiah_num(-back_data.out_alokasi)
            this.el.fincard.back.body.left.textContent = common.format_rupiah_num(back_data.left)
            this.set_updated_text(fincard.updated_timestamp)
        }
        update_data_multi_periode(periode: string, fincard_periode: DatabaseKeuangan.FincardPeriode): void {
            const periode_front_data = {
                title: `KM FK UII ${main.keuangan.fincard.shorten_periode_text(periode)}`,
                out: 0,
                in: 0,
                left: 0,
                rkat: [] as number[],
                updated: 0,
                lpj: 0,
            }
            const periode_back_data = {
                out_rkat: 0,
                out_dpm: 0,
                in_dpm: 0,
                in_alokasi: 0,
                out_alokasi: 0,
                left: 0,
            }
            let fincard_count = 0
            for (const fincard_organisasi of Object.values(fincard_periode)) {
                for (const uid in fincard_organisasi) {
                    const fincard = fincard_organisasi[uid]
                    const front_data = main.keuangan.fincard.get_front_card_data_single(fincard)
                    const back_data = main.keuangan.fincard.get_back_card_data_single(fincard)
                    periode_front_data.out += front_data.out
                    periode_front_data.in += front_data.in
                    periode_front_data.left += front_data.left
                    if (!periode_front_data.rkat.includes(fincard.tahun_rkat)) {
                        periode_front_data.rkat.push(fincard.tahun_rkat)
                    }
                    periode_back_data.out_rkat += back_data.out_rkat
                    periode_back_data.out_dpm += back_data.out_dpm
                    periode_back_data.in_dpm += back_data.in_dpm
                    periode_back_data.in_alokasi += back_data.in_alokasi
                    periode_back_data.out_alokasi += back_data.out_alokasi
                    periode_back_data.left += back_data.left
                    if (fincard.updated_timestamp > periode_front_data.updated) {
                        periode_front_data.updated = fincard.updated_timestamp
                    }
                    fincard_count++
                    if (fincard.status_lpj > StatusRapat.IN_PROGRESS) {
                        periode_front_data.lpj++
                    }
                }
            }
            this.set_title(periode_front_data.title)
            this.el.fincard.front.body.out.textContent = common.format_rupiah_num(periode_front_data.out)
            this.el.fincard.front.body.in.textContent = common.format_rupiah_num(periode_front_data.in)
            this.el.fincard.front.body.left.textContent = common.format_rupiah_num(periode_front_data.left)
            if (periode_front_data.rkat.length > 0) {
                if (periode_front_data.rkat.length > 1) {
                    periode_front_data.rkat.sort((a, b) => a - b)
                    this.set_front_rkat_text(`${periode_front_data.rkat[0]}—${periode_front_data.rkat[periode_front_data.rkat.length - 1]}`)
                }
                else {
                    this.set_front_rkat_text(`${periode_front_data.rkat[0]}`)
                }
            }
            this.el.fincard.front.body.lpj.textContent = `${periode_front_data.lpj}/${fincard_count} (${Math.ceil((periode_front_data.lpj / (fincard_count || 1)) * 100)}%)`
            this.el.fincard.back.body.out_rkat.textContent = common.format_rupiah_num(-periode_back_data.out_rkat)
            this.el.fincard.back.body.out_dpm.textContent = common.format_rupiah_num(-periode_back_data.out_dpm)
            this.el.fincard.back.body.in_dpm.textContent = common.format_rupiah_num(periode_back_data.in_dpm, true)
            this.el.fincard.back.body.in_alokasi.textContent = common.format_rupiah_num(periode_back_data.in_alokasi, true)
            this.el.fincard.back.body.out_alokasi.textContent = common.format_rupiah_num(-periode_back_data.out_alokasi)
            this.el.fincard.back.body.left.textContent = common.format_rupiah_num(periode_back_data.left)
            if (periode_front_data.updated > 0) {
                this.set_updated_text(periode_front_data.updated)
            }
        }
        update_data_multi_organisasi(periode: string, organisasi_index: string, fincard_organisasi: DatabaseKeuangan.FincardOrganisasi): void {
            this.update_data_multi_periode(periode, { [organisasi_index]: fincard_organisasi })
            this.set_title(`${Object.values(OrganisasiKegiatan)[Number(organisasi_index)] || 'Organisasi'} ${main.keuangan.fincard.shorten_periode_text(periode)}`)
        }
    }
}
