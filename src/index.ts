let NEXT_PAGE = 1

window.addEventListener('hashchange',(e)=>{
    e.preventDefault()
    if(window.location.hash.slice(1)){
        getCocktail(Number(window.location.hash.slice(1)))
        document.querySelectorAll('.cocktail').forEach(button=>{
            button.classList.remove('open')
        })
        const btn = document.querySelector(`.nr${window.location.hash.slice(1)}`) as Element
        btn.classList.add('open')
    }
})

document.addEventListener('DOMContentLoaded',()=>{
    getCocktails()
    getAllCategories()
    getAllGlasses()

    document.querySelector('h1')?.addEventListener('click',()=>{
        getCocktails()
    })
    // display the cocktail if necessary
    if(window.location.hash.slice(1)){
        getCocktail(Number(window.location.hash.slice(1)))
    }
    // mobile menu functionality
    const menu = document.querySelector('.arrow') as Element
    menu.addEventListener('click',()=>{
        const search = document.querySelector('.search') as Element
        const left = document.querySelector('.left') as Element
        search.classList.toggle('show')
        left.classList.toggle('show')
        menu.classList.toggle('show')
    })
    // favorite search
    const listFavoritesBtn = document.querySelector('.list_favorites') as Element
    listFavoritesBtn.addEventListener('click',()=>{
        const selectCategory = document.querySelector('#in_category') as HTMLSelectElement
        const selectGlass = document.querySelector('#in_glass') as HTMLSelectElement
        listFavoritesBtn.classList.toggle('active')
        searchByCategoryGlassFavorite(selectCategory, selectGlass)
    })
    // search by name functionality
    document.querySelector('#search_btn')?.addEventListener('click',(e:Event)=>{
        e.preventDefault()
        const text = document.querySelector('#in_name') as HTMLInputElement
        getCocktails(`https://cocktails.solvro.pl/api/v1/cocktails/?name=${text.value}&ingredients=1`)
    })
    })

async function get_req(url:string) {
    try{
        const req = await fetch(url)
        const data = await req.json()
        if(req.ok){
            return data
        }
        throw new Error('Problem getting cocktails.')
    }catch(error){
        throw error
    }
}
/**
 * get cocktails and fill the right side bar, add pagination.
 * @param url string
 */
async function getCocktails(url:string = `https://cocktails.solvro.pl/api/v1/cocktails/?ingredients=1`,page=1) {
    try{
        let _url1 = url+`&page=${page}`
        const cocktails = await get_req(_url1)
        NEXT_PAGE = cocktails.meta.currentPage +1

        const listOfCocktails = document.querySelector('.cocktails_list') as Element
        // clear list of cocktails and add new ones
        listOfCocktails.innerHTML = ''
        cocktails.data.forEach((cocktail:any)=>{
            const btn = document.createElement('button')
            btn.classList.add('cocktail')
            btn.classList.add(`nr${cocktail.id}`)
            btn.innerHTML = `
            <div class="filter"><img class="small-img" src="${cocktail.imageUrl}" alt="${cocktail.name}"></div><p> ${cocktail.name}</p>
            `

            // favorite functionality
            const favorite = document.createElement('button')
            favorite.classList.add('favorite')
            favorite.innerHTML =             `
                                <?xml version="1.0" ?><svg height="24" version="1.1" width="24" xmlns="http://www.w3.org/2000/svg" xmlns:cc="http://creativecommons.org/ns#" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><g transform="translate(0 -1028.4)"><path d="m8.5 1032.4c-3.0376 0-5.5 2.5-5.5 5.5 0 1.6 0.6167 2.9 1.5938 3.9 0.1337 0.2 0.2591 0.3 0.4062 0.5l7 7.1 7-7.1 0.344-0.4c1.013-1 1.656-2.4 1.656-4 0-3-2.462-5.5-5.5-5.5-1.329 0-2.549 0.4-3.5 1.2-0.951-0.8-2.1711-1.2-3.5-1.2z" fill="#000"/><path d="m8.8889 1033.4c-2.7001 0-4.8889 2.2-4.8889 4.9 0 1.3 0.5481 2.5 1.4167 3.4 0.1188 0.2 0.2303 0.3 0.3611 0.4l6.2222 6.3 6.222-6.3 0.306-0.3c0.901-0.9 1.472-2.1 1.472-3.5 0-2.7-2.189-4.9-4.889-4.9-1.181 0-2.266 0.4-3.111 1.1-0.845-0.7-1.93-1.1-3.1111-1.1z" fill="#eee"/></g></svg>
            `
            favorite.id = cocktail.id
            if(JSON.parse(String(localStorage.getItem('favorite'))).includes(cocktail.id)){
                favorite.classList.add('listed')
            }

            favorite.addEventListener('click',()=>{
                toggleFavorite(favorite)
            })
            // change view and history when button clicked
            btn.addEventListener('click',()=>{
                history.pushState({page:cocktail.id},'',`#${cocktail.id}`)
                ChangeView(cocktail)
                document.querySelectorAll('.cocktail').forEach(button=>{
                    button.classList.remove('open')
                })
                btn.classList.add('open')
            })
            if(Number(window.location.hash.slice(1)) === cocktail.id){
                btn.classList.add('open')
            }
            listOfCocktails.insertAdjacentElement('beforeend',btn)
            listOfCocktails.insertAdjacentElement('beforeend',favorite)
        })
        if (cocktails.data.length === 0){
            listOfCocktails.innerHTML="<p class='no-found'>no drinks 🥺</p>"
        }
        //add pagination
        const pagination = document.querySelector('.pagination') as Element
        pagination.innerHTML = ''
        if(cocktails.meta.total > cocktails.meta.perPage){
            const metaData = cocktails.meta

            const btnPrev = document.createElement('button')
            btnPrev.innerHTML = 'before'
            btnPrev.classList.add('pagination_btn')
            const btnNext = document.createElement('button')
            btnNext.innerHTML = 'next'
            btnNext.classList.add('pagination_btn')

            const btnFirst = document.createElement('button')
            btnFirst.innerHTML = metaData.firstPage
            btnFirst.classList.add('pagination_btn')
            const btnLast = document.createElement('button')
            btnLast.innerHTML = metaData.lastPage
            btnLast.classList.add('pagination_btn')


            pagination.insertAdjacentElement('beforeend',btnFirst)
            // add middle btn
            if(metaData.currentPage !== metaData.lastPage && metaData.currentPage !== 1){
                const btnMiddle = document.createElement('button')
                btnMiddle.innerHTML = metaData.currentPage
                btnMiddle.classList.add('pagination_btn')
                btnMiddle.classList.add('active')
                pagination.insertAdjacentElement('beforeend',btnMiddle)
        }
            pagination.insertAdjacentElement('beforeend',btnLast)

            if(metaData.currentPage !== 1){
                pagination.insertAdjacentElement('afterbegin',btnPrev)
            }else{
                btnFirst.classList.add('active')
            }
            if(metaData.currentPage !== metaData.lastPage){
                pagination.insertAdjacentElement('beforeend',btnNext)
            }else{
                btnLast.classList.add('active')
            }
            // add event listeners

            btnFirst.addEventListener('click',()=>{
                getCocktails(url,1)
            })
            btnLast.addEventListener('click',()=>{
                getCocktails(url,metaData.lastPage)
            })
            btnNext.addEventListener('click',()=>{
                getCocktails(url,NEXT_PAGE)
            })
            btnPrev.addEventListener('click',()=>{

                getCocktails(url,NEXT_PAGE-2)
            })
        }
    }catch(error){
        console.warn(error)
    }
}

/**
 * fetch all categories and add options to the select element.
 * add event listener (on change) to the select element after adding options.
 */
async function getAllCategories() {
    try{
        const categories = await get_req('https://cocktails.solvro.pl/api/v1/cocktails/categories')
        const selectCategory = document.querySelector('#in_category') as HTMLSelectElement
        const selectGlass = document.querySelector('#in_glass') as HTMLSelectElement

        categories.data.forEach((category:string) => {
            selectCategory?.insertAdjacentHTML('beforeend',`<option value="${category}">${category}</option>`)
        });
        selectCategory?.addEventListener('change',()=>{
            searchByCategoryGlassFavorite(selectCategory,selectGlass)
        })
    }catch(error){
        console.warn(error)
    }
}

/**
 * get all glasses (and add functionality and options to the select element in header)
 *
 */
async function getAllGlasses() {
    try{
        const glasses = await get_req('https://cocktails.solvro.pl/api/v1/cocktails/glasses')
        const selectGlass = document.querySelector('#in_glass') as HTMLSelectElement
        const selectCategory = document.querySelector('#in_category') as HTMLSelectElement

        glasses.data.forEach((glass:string) => {
            selectGlass?.insertAdjacentHTML('beforeend',`<option value="${glass}">${glass}</option>`)
        });
        selectGlass?.addEventListener('change',()=>{
            searchByCategoryGlassFavorite(selectCategory,selectGlass)
        })
    }catch(error){
        console.warn(error)
    }
}

/**
 * get single cocktail and change the view
 *
 * @param {number} id
 */
async function getCocktail(id:number){
    try{
        const cocktail = await get_req( `https://cocktails.solvro.pl/api/v1/cocktails/?ingredients=1&id=${id}`)
        if(cocktail.data[0]?.id){
            ChangeView(cocktail.data[0])
        }
    }catch(error){
        console.warn(error)
    }
}

/**
 * add and remove from local storage the item
 *
 * @param {Element} favorite
 */
function toggleFavorite(favorite:Element):void{
    const users_favorite = JSON.parse(String(localStorage.getItem('favorite'))) || []
    if(users_favorite.includes(Number(favorite.id))){
        users_favorite.splice(users_favorite.indexOf(Number(favorite.id)),1)
    }else{
        users_favorite.push(Number(favorite.id))
    }
    favorite.classList.toggle('listed')
    localStorage.setItem('favorite',JSON.stringify(users_favorite))
}

/**
 * Change the right section of application - display single cocktail
 *
 * @param {*} data
 */
function ChangeView(data:any){
    // console.log(data.id)
    const image = document.querySelector('#main_image') as HTMLImageElement
    image.src = data.imageUrl
    const header = document.querySelector('#main_header') as HTMLElement
    header.innerHTML = `${data.name}<span class="category">${data.category}</span>`

    const info = document.querySelector('#main_info') as HTMLElement
    info.innerHTML = `
    <div>
        <?xml version="1.0" ?><svg class="feather feather-percent" fill="none" height="24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><line x1="19" x2="5" y1="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
        <p> ${data.alcoholic ? 'Yes' : 'No'}</p>
    </div>
    <div>
        <?xml version="1.0" ?><!DOCTYPE svg  PUBLIC '-//W3C//DTD SVG 1.1//EN'  'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'><svg enable-background="new 0 0 32 32" height="32px" id="Layer_1" version="1.1" viewBox="0 0 32 32" width="32px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g><polyline fill="none" points="   649,137.999 675,137.999 675,155.999 661,155.999  " stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2"/><polyline fill="none" points="   653,155.999 649,155.999 649,141.999  " stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2"/><polyline fill="none" points="   661,156 653,162 653,156  " stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2"/></g><path d="M29.756,3.655c0.256-0.296,0.316-0.714,0.153-1.07C29.747,2.229,29.392,2,29,2H11c-0.552,0-1,0.448-1,1s0.448,1,1,1h15.81  l-2.908,3.356c-2.603-1.158-5.675-0.864-7.993,0.838c-2.111,1.55-4.936,1.558-7.055,0.034L5.19,4H7c0.552,0,1-0.448,1-1S7.552,2,7,2  H3C2.608,2,2.253,2.229,2.09,2.584c-0.163,0.356-0.103,0.774,0.154,1.07L15,18.374V28h-4c-0.552,0-1,0.447-1,1s0.448,1,1,1h10  c0.553,0,1-0.447,1-1s-0.447-1-1-1h-4v-9.626L29.756,3.655z M12.352,11.369c1.66,0,3.321-0.521,4.74-1.563  c1.57-1.154,3.605-1.446,5.425-0.853L16,16.473l-4.481-5.17C11.797,11.332,12.074,11.369,12.352,11.369z"/></svg>
        <p>
        ${data.glass}</p>
    </div>
    `

    const ingredientsHeader = document.querySelector('.ingredients') as HTMLElement
    ingredientsHeader.innerHTML = "Ingredients"
    const ingredientsList = document.querySelector('#ingredients_list') as HTMLElement
    ingredientsList.innerHTML = ''
    data.ingredients.forEach((ing : any)=>{
        ingredientsList.innerHTML+= `<li>${ing.name}</li>`
    })
    ingredientsList.innerHTML = ingredientsList.innerHTML.slice(0,-2)
    const instructions = document.querySelector('#main_instructions') as HTMLElement
    instructions.innerHTML = `<h3 class="recipe">Recipe</h3><p>${data.instructions}</p>`

}

/**
 * advanced search with category, glass values and check if user wants to display favorites
 *
 * @param {HTMLSelectElement} selectCategory
 * @param {HTMLSelectElement} selectGlass
 */
function searchByCategoryGlassFavorite(selectCategory:HTMLSelectElement, selectGlass:HTMLSelectElement){
    const listFavoritesBtn = document.querySelector('.list_favorites') as Element
    if(listFavoritesBtn.classList.contains('active')){
        const list_of_cocktails = JSON.parse(String(localStorage.getItem('favorite')))
        getCocktails(`https://cocktails.solvro.pl/api/v1/cocktails/?id=${list_of_cocktails}&category=${selectCategory.value}&glass=${selectGlass.value}&ingredients=1`)
    }
    else{
        getCocktails(`https://cocktails.solvro.pl/api/v1/cocktails/?category=${selectCategory.value}&glass=${selectGlass.value}&ingredients=1`)
    }
}