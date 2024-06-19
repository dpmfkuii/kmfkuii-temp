namespace Fincard {
    export enum Mode {
        SINGLE = 'Single',
        MULTI = 'Multi',
    }
    export enum Rating {
        BASIC = 'Basic',
        GOLD = 'Gold',
        PLATINUM = 'Platinum',
    }
    export class Card {
        mode: Mode
        rating: Rating
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
                        updated: HTMLSpanElement
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
                        lpj: HTMLSpanElement
                    }
                    footer: {
                        el: HTMLDivElement
                        more_button: HTMLDivElement
                        flip_button: HTMLDivElement
                    }
                }
            }
        }
        constructor(mode: Mode = Mode.SINGLE, rating: Rating = Rating.BASIC) {
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
                        el: dom.c('div', { classes: ['fincard', 'fincard-basic', 'fincard-shine'] }),
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
                            updated: p,
                        },
                        footer: {
                            el: dom.c('div', { classes: ['fincard-footer'] }),
                            more_button: bb('bars'),
                            flip_button: bb('reply'),
                        },
                    },
                    back: {
                        el: dom.c('div', { classes: ['fincard', 'fincard-basic', 'fincard-shine'] }),
                        body: {
                            el: dom.c('div', { classes: ['fincard-body'] }),
                            out_rkat: p,
                            out_dpm: p,
                            in_dpm: p,
                            in_alokasi: p,
                            out_alokasi: p,
                            left: p,
                            lpj: p,
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
    <th scope="col" class="fw-normal label"><i class="fa-solid fa-clock-rotate-left label" ${tt('Terakhir diperbarui')}></i></th>
</tr>
<tr>
    <td><span class="fincard-rkat-text">-</span></td>
    <td><span class="fincard-updated-text">-</span></td>
</tr></tbody></table>
            `
            this.el.fincard.front.body.out = dom.qe(this.el.fincard.front.body.el, '.fincard-out-text')!
            this.el.fincard.front.body.rating = dom.qe(this.el.fincard.front.body.el, '.fincard-rating-text')!
            this.el.fincard.front.body.in = dom.qe(this.el.fincard.front.body.el, '.fincard-in-text')!
            this.el.fincard.front.body.left = dom.qe(this.el.fincard.front.body.el, '.fincard-left-text')!
            this.el.fincard.front.body.rkat = dom.qe(this.el.fincard.front.body.el, '.fincard-rkat-text')!
            this.el.fincard.front.body.updated = dom.qe(this.el.fincard.front.body.el, '.fincard-updated-text')!
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
        <th scope="row" class="label">LPJ</th>
        <td ${tt('Status verifikasi LPJ DPM')}>
            <i class="fa-solid fa-check-double label"></i>
            <span class="fincard-lpj-text">-</span>
        </td>
    </tr></tbody></table>
            `
            this.el.fincard.back.body.out_rkat = dom.qe(this.el.fincard.back.body.el, '.fincard-out-rkat-text')!
            this.el.fincard.back.body.out_dpm = dom.qe(this.el.fincard.back.body.el, '.fincard-out-dpm-text')!
            this.el.fincard.back.body.in_dpm = dom.qe(this.el.fincard.back.body.el, '.fincard-in-dpm-text')!
            this.el.fincard.back.body.in_alokasi = dom.qe(this.el.fincard.back.body.el, '.fincard-in-alokasi-text')!
            this.el.fincard.back.body.out_alokasi = dom.qe(this.el.fincard.back.body.el, '.fincard-out-alokasi-text')!
            this.el.fincard.back.body.left = dom.qe(this.el.fincard.back.body.el, '.fincard-left-text')!
            this.el.fincard.back.body.lpj = dom.qe(this.el.fincard.back.body.el, '.fincard-lpj-text')!
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
        }
        get_html_element(): HTMLDivElement {
            return this.el.flip_card.el
        }
        hide_el(el: HTMLElement) {
            el.classList.add('visually-hidden')
        }
        show_el(el: HTMLElement) {
            el.classList.remove('visually-hidden')
        }
        update_mode(): void {
            const lpj_icon = dom.qe<'i'>(this.el.fincard.back.body.el, 'table > tbody > tr:last-child > td > i')!
            switch (this.mode) {
                case Mode.SINGLE:
                    this.hide_el(this.el.fincard.front.footer.more_button)
                    this.hide_el(this.el.fincard.back.footer.more_button)
                    lpj_icon.classList.add('fa-check')
                    lpj_icon.classList.remove('fa-check-double')
                    break
                case Mode.MULTI:
                default:
                    this.show_el(this.el.fincard.front.footer.more_button)
                    this.show_el(this.el.fincard.back.footer.more_button)
                    lpj_icon.classList.add('fa-check-double')
                    lpj_icon.classList.remove('fa-check')
                    break
            }
        }
        update_rating(): void {
            this.el.fincard.front.body.rating.textContent = this.rating
            this.el.fincard.front.el.classList.remove('fincard-basic')
            this.el.fincard.front.el.classList.remove('fincard-gold')
            this.el.fincard.front.el.classList.remove('fincard-platinum')
            this.el.fincard.back.el.classList.remove('fincard-basic')
            this.el.fincard.back.el.classList.remove('fincard-gold')
            this.el.fincard.back.el.classList.remove('fincard-platinum')
            switch (this.rating) {
                case Rating.GOLD:
                    this.el.fincard.front.el.classList.add('fincard-gold')
                    this.el.fincard.back.el.classList.add('fincard-gold')
                    break
                case Rating.PLATINUM:
                    this.el.fincard.front.el.classList.add('fincard-platinum')
                    this.el.fincard.back.el.classList.add('fincard-platinum')
                    break
                case Rating.BASIC:
                default:
                    this.el.fincard.front.el.classList.add('fincard-basic')
                    this.el.fincard.back.el.classList.add('fincard-basic')
                    break
            }
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
            this.el.fincard.front.body.updated.textContent = `${mm}/${yy}`
            main.set_bs_tooltip(this.el.fincard.front.body.updated, d.toLocaleString())
        }
        update_data_single(fincard: DatabaseKeuangan.Fincard): void {
            const front_data = main.keuangan.fincard.get_front_card_data_single(fincard)
            const back_data = main.keuangan.fincard.get_back_card_data_single(fincard)
            this.set_title(front_data.title)
            this.el.fincard.front.body.out.textContent = front_data.out
            this.el.fincard.front.body.in.textContent = front_data.in
            this.el.fincard.front.body.left.textContent = front_data.left
            this.set_front_rkat_text(front_data.rkat)
            this.set_updated_text(fincard.updated_timestamp)
            this.el.fincard.back.body.out_rkat.textContent = back_data.out_rkat
            this.el.fincard.back.body.out_dpm.textContent = back_data.out_dpm
            this.el.fincard.back.body.in_dpm.textContent = back_data.in_dpm
            this.el.fincard.back.body.in_alokasi.textContent = back_data.in_alokasi
            this.el.fincard.back.body.out_alokasi.textContent = back_data.out_alokasi
            this.el.fincard.back.body.left.textContent = back_data.left
            this.el.fincard.back.body.lpj.textContent = back_data.lpj
        }
    }
}
