const form = document.querySelector('form') as HTMLFormElement
const input_nama_kegiatan = document.querySelector('#input_nama_kegiatan') as HTMLInputElement
const submit_button = document.querySelector('#input_submit_button') as HTMLButtonElement

const get_radio_input_value = (name: string) => {
    let value = ''
    const input = document.querySelectorAll(`input[name="${name}"]`) as NodeListOf<HTMLInputElement>
    input.forEach(n => {
        if (n.checked) value = n.value
    })
    return value
}

const get_jenis_verif = () => get_radio_input_value('jenis_verif')
const get_verif_dengan = () => get_radio_input_value('verif_dengan')

const loop = () => {
    submit_button.innerHTML = `<strong>PESAN VERIF</strong> ${get_jenis_verif()}${input_nama_kegiatan.value ? '_' : ''}${input_nama_kegiatan.value} dengan ${get_verif_dengan()}`
    window.requestAnimationFrame(loop)
}

window.requestAnimationFrame(loop)
