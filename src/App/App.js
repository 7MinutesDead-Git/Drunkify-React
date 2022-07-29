import React, {useEffect, useState} from 'react'

import Drink from './Drink'
import Counter from "../FunStuff/Counter"
import {sanitizeInput, toggleOpacityOnScroll} from "../Helpers/helpers"
import {APIErrorHandler} from "../Helpers/APIErrorHandler"

// ---------------------------------------------------------------------------
// TODOS:
// 1) Hide/reveal search history/suggestions on input focus.
//      - Store/Load from localStorage().
// 2) Make API calls for drinks/ingredients.
// 3) Build out Drink component dynamically.
// 4) Make API calls for ingredients clicked.
// 5) Setup React Router so drinks can be saved/navigated to.

const SEARCH_HISTORY_LIMIT = 5
const DRINK_REVEAL_SPEED = 180  // milliseconds, lower is faster
const AUTOSCROLL_DELAY = 75
const errors = new APIErrorHandler()


// ---------------------------------------------------------------------------
export default function App() {
    // NOTE: Components are re-rendered when state changes.
    const [searchTerm, setSearchTerm] = useState('')
    const [drinkList, setDrinkList] = useState([])
    const [loadingClassName, setLoadingClassName] = useState("lds-ellipsis")
    const [fetchedDrinks, setFetchedDrinks] = useState([])
    const [drinksOnDisplay, setDrinksOnDisplay] = useState({})
    const [drinks, setDrinks] = useState([])

    // searchTerm is grabbed from onChange event passed down to SearchInput.
    function updateSearchInput(event) {
        const newSearchTerm = sanitizeInput(event.target.value)
        setSearchTerm(newSearchTerm)
    }

    async function getDrinks() {
        console.log(`Hello from App -> ${searchTerm}`)
        clearScreen()
        // TODO Store choice in localStorage to display as history.
        // addSearchToLocalHistory(choice)
        const drinkURL = `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${searchTerm}`
        const ingredientURL = `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${searchTerm}`
        errors.clearErrors()
        toggleLoadingIcon()

        const nameResponse = fetchDrinksByName(drinkURL)
        // TODO: I don't think await is necessary here since we Promise.allSettled() later.
        const ingredientResponse = fetchDrinksByIngredient(ingredientURL)
        setFetchedDrinks([nameResponse, ingredientResponse])
        // We should wait for all drink API fetches to complete successfully, otherwise
        // we run into issues where drinks are rendered before the API has responded,
        // resulting in empty spaces and missing drinks/information.
        await Promise.allSettled([nameResponse, ingredientResponse])
         revealDrinks()
         errors.renderErrors()
    }

    async function revealDrinks() {
        toggleLoadingIcon()
        for (const drink of document.querySelectorAll('.drink')) {
            await wait(DRINK_REVEAL_SPEED)
            drink.style.opacity = '1'
        }
    }

    async function fetchDrinksByIngredient(idURL) {
        try {
            console.log('Fetching drinks by ingredient...')
            const response = await fetch(idURL)
            console.log(`Ingredient response: ${response.status}`)
            errors.storeError(response.status)
            const data = await response.json()
            console.log(data)
            if (data['drinks']) {
                for (const drink of data['drinks']) {
                    if (!(drinkExists(drink))) {
                        const idNumber = drink['idDrink']
                        const drinkURL = `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${idNumber}`
                        // If we were to await fetchDrinks here, each iteration of this loop will wait. May be useful in the future.
                        // We should return this fetch response here to be used in collecting all Promises for
                        // Promise.all() to wait for in getDrinks().
                        fetchedDrinks.push(fetchDrinksByName(drinkURL))
                    }
                }
            }
            else {
                errors.storeError(`Couldn't find "${searchTerm}" :(`)
            }
            return response
        }
        catch (err) {
            console.log(`Caught this error: ${err}`)
        }
    }

    // Retrieve drink data by name and render them on the screen.
    // Returns the response object for managing Promises.
    async function fetchDrinksByName(url) {
        try {
            console.log('Fetching drinks by name...')
            const response = await fetch(url)
            errors.storeError(response.status)

            const data = await response.json()
            console.log("Drink by name data:")
            console.log(data)
            if (data['drinks']) {
                await renderDrinks(data)
            }
            else {
                errors.storeError(`Couldn't find "${searchTerm}" :(`)
            }
            return response
        }
        catch (err) {
            console.log(`Caught this error: ${err}`)
            if (!window.navigator.onLine) {
                errors.storeError('You are offline. Are you still connected to the internet?')
            }
        }
    }

    // Create each drink block and append them to the cocktail list to be displayed.
    function renderDrinks(data) {
        for (const drinkData of data['drinks']) {
            if (!(drinkExists(drinkData))) {
                const newDrinksOnDisplay = {...drinksOnDisplay}
                newDrinksOnDisplay[drinkData['strDrink']] = true
                setDrinksOnDisplay(newDrinksOnDisplay)

                // Drink component created here.
                const drink = <Drink drinkData={drinkData}/>
                const newDrinkList = [...drinkList, drink]
                setDrinkList(newDrinkList)
            }
        }
    }

    // Check if the given drink is already on the page.
    function drinkExists(drink) {
        const exists = drink['strDrink'] in drinksOnDisplay
        if (exists)
            console.log(`${drink['strDrink']} already exists on the page. Skipping.`)
        return exists
    }

    function handleClearButton() {
        clearScreen()
        clearInput()
    }

    function clearScreen() {
        setDrinkList([])
    }

    function clearInput() {
        setSearchTerm("")
    }

    function handleEnterKeyDown(event) {
        if (event.key === 'Enter')
            getDrinks()
    }

    // Toggle the loading icon visibility.
    function toggleLoadingIcon() {
        loadingClassName === "lds-ellipsis" ?
            setLoadingClassName("lds-ellipsis-active") :
            setLoadingClassName("lds-ellipsis")
    }

    async function clickIngredient(event) {
        // Search by ingredient just by clicking on the ingredient link.
        if (event.target.tagName === 'A') {
            const ingredientName = event.target.innerText
            setSearchTerm(ingredientName)
            await getDrinks(ingredientName)
        }
        else
            await toggleDrinkFocus(event.target)
    }

    // Enter and exit focus on a drink button.
    // Scrolls to the drink button's current location on focus and unfocus.
    async function toggleDrinkFocus(drink) {
        drink.classList.toggle('viewing')
        // Adding an arbitrary pause seems to eliminate most occurences of scrolling
        // occasionally stopping abruptly when the user clicks on a drink button.
        // TODO: Find a more programmatic solution to this :P
        await wait(AUTOSCROLL_DELAY)
        drink.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        })
    }

    // Ensures the search input is cleared when the user clicks the clear button.
    useEffect(() => {
        const input = document.querySelector('input')
        input.value = searchTerm
    })

    return (
        // Check out https://reactjs.org/docs/fragments.html
        <>
            <SearchNav>
                <header className="nav">
                    <label className="search-label" htmlFor="search">Search for drinks by name or ingredient.</label>
                    <SearchControls>
                        <section className="search-controls">
                            <section className="searchbar">
                                <SearchInput onChange={updateSearchInput} onKeyDown={handleEnterKeyDown}/>
                                <SearchButton onClick={getDrinks}/>
                                <ClearButton clear={handleClearButton}/>
                            </section>
                            <ul className="suggestions hidden"></ul>
                        </section>
                    </SearchControls>
                    <section className="error-text"></section>
                </header>
            </SearchNav>
            <LoadingIcon className={loadingClassName}/>
            <DrinksView>
                {drinks}
            </DrinksView>
            <FooterNav/>
        </>
    )
}


// ------------------------------------------------------------------------------------------------------------
// App Components
const SearchNav = (props) => {
    return (
        <>{props.children}</>
    )
}

const DrinksView = (props) => {
    return (
        <section className="cocktails-view">
            <LoadingIcon/>
            <div id="app-counter"></div>
            <ul className="cocktails"></ul>
        </section>
    )
}

const FooterNav = (props) => {
    return (
        <footer className="about">
            <p>© 2022 Drunkify | Design by
                <a href="https://7minutes.dev" target="_blank" rel="noreferrer">
                    7 Minutes Dev
                </a>
            </p>
            <Counter/>
        </footer>
    )
}

const LoadingIcon = (props) => {
    return (
        <div className={props.className}>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>
    )
}


// ------------------------------------------------------------------------------------------------------------
// SearchNav components
const SearchControls = (props) => {
    useEffect(() => {
        const controlsElement = document.querySelector('.search-controls')
        window.onscroll = () => {
            toggleOpacityOnScroll(controlsElement)
        }
        // Clean up on unmount.
        return () => {
            window.onscroll = null
        }
    })

    return (
        <>{props.children}</>
    )
}

const SearchInput = (props) => {
    const cycleDelay = 3000
    const fadeDelay = 500
    // Cycles through placeholder suggestions.
    const [placeholderText, setPlaceholderText] = useState('amaretto sunrise')
    const [index, setIndex] = useState(0)

    // --------------------------------------------------------------------------------
    // An effect for fading in placeholder suggestions on a timer in sequence.
    useEffect(() => {
        const suggestionsList = [
            'coffee',
            'tequila',
            'banana milk shake',
            'espresso martini',
            'grenadine',
            'salt',
            'amaretto sunrise',
            'margarita',
            'orange juice',
            'strawberries',
            'daiquiri'
        ]

        function getNextPlaceholder() {
            const selection = suggestionsList[index % suggestionsList.length]
            setIndex(index + 1)
            return selection
        }

        async function fadeInNewText() {
            const input = document.querySelector('input')
            input.classList.add('hide-placeholder')
            await wait(fadeDelay)
            setPlaceholderText(getNextPlaceholder())
            input.classList.remove('hide-placeholder')
        }

        const timer = setTimeout(async () => {
            await fadeInNewText()
        }, cycleDelay)
        return () => clearTimeout(timer)
    })

    return (
        <input type="text"
            id="search"
            placeholder={placeholderText}
            autoComplete="off"
            onChange={props.onChange}
            onKeyDown={props.onKeyDown}
        />
    )
}

const SearchButton = (props) => {
    return (
        // Set onClick={getDrinks} here
        <button id="getCocktails" onClick={props.onClick}>
            find drink
        </button>
    )
}

const ClearButton = (props) => {
    return (
        <button id="clearCocktails" onClick={props.clear}>clear</button>
    )
}


// ------------------------------------------------------------------------------------------------------------
// Static functions

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}