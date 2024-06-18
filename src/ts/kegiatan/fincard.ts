enum FincardMode {
    SINGLE = 'Single',
    MULTI = 'Multi',
}

class Fincard {
    mode: FincardMode
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
                }
                footer: {
                    el: HTMLDivElement
                    more_button: HTMLDivElement
                    flip_button: HTMLDivElement
                }
            }
        }
    }
    constructor(mode: FincardMode = FincardMode.SINGLE) {
        const bb = (b: string) => dom.c('div', { classes: ['col', 'd-grid', 'px-0', 'py-2'], attributes: { role: 'button' }, html: `<i class="fa-solid fa-${b}"></i>` })
        const tt = (t: string) => `data-bs-toggle="tooltip" data-bs-title="${t}"`

        this.mode = mode

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
    <th scope="col" class="fw-normal label"><span ${tt('Rating pengeluaran')}>Rating</span></th>
</tr>
<tr>
    <td class="fincard-out-text">-</td>
    <td class="fincard-rating-text">-</td>
</tr>
<tr>
    <th scope="col" class="fw-normal label"><span ${tt('Pemasukan')}>In</span></th>
    <th scope="col" class="fw-normal label"><span ${tt('Sisa tersedia')}>Left</span></th>
</tr>
<tr>
    <td class="fincard-in-text">-</td>
    <td class="fincard-left-text">-</td>
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
        <span>-</span>
    </td>
</tr>
<tr><td colspan="2"><hr class="my-1" /></td></tr>
<tr>
    <th scope="row" rowspan="2" class="label">DPM</th>
    <td ${tt('Keluar DPM')}>
        <i class="fa-solid fa-circle-right label"></i>
        <span>-</span>
    </td>
</tr>
<tr>
    <td ${tt('Masuk DPM')}>
        <i class="fa-regular fa-circle-left label"></i>
        <span>-</span>
    </td>
</tr>
<tr><td colspan="2"><hr class="my-1" /></td></tr>
<tr>
    <th scope="row" rowspan="3" class="label">Alokasi</th>
    <td ${tt('Masuk alokasi')}>
        <i class="fa-regular fa-circle-left label"></i>
        <span>-</span>
    </td>
</tr>
<tr>
    <td ${tt('Keluar alokasi')}>
        <i class="fa-solid fa-circle-right label"></i>
        <span>-</span>
    </td>
</tr>
<tr>
    <td ${tt('Sisa tersedia')}>
        <i class="fa-solid fa-equals label"></i>
        <span>-</span>
    </td>
</tr>
<tr><td colspan="2"><hr class="my-1" /></td></tr>
<tr>
    <th scope="row" class="label">LPJ</th>
    <td ${tt('Status verifikasi LPJ')}>
        <i class="fa-solid fa-check-double label"></i>
        <span>-</span>
    </td>
</tr></tbody></table>
        `
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
            case FincardMode.SINGLE:
                this.hide_el(this.el.fincard.front.footer.more_button)
                this.hide_el(this.el.fincard.back.footer.more_button)
                lpj_icon.classList.add('fa-check')
                lpj_icon.classList.remove('fa-check-double')
                break
            case FincardMode.MULTI:
            default:
                this.show_el(this.el.fincard.front.footer.more_button)
                this.show_el(this.el.fincard.back.footer.more_button)
                lpj_icon.classList.add('fa-check-double')
                lpj_icon.classList.remove('fa-check')
                break
        }
    }
    update_height(): void {
        this.el.flip_card.el.style.height = `${Math.max(this.el.fincard.front.el.getBoundingClientRect().height, this.el.fincard.back.el.getBoundingClientRect().height)}px`
    }
}
