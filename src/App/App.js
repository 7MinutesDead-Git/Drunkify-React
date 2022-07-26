import React, {useEffect, useState} from 'react'

import Counter from "../FunStuff/Counter"
import {sanitizeInput, toggleOpacityOnScroll} from "../Helpers/helpers"

// ---------------------------------------------------------------------------
// TODOS:
// 1) Hide/reveal search history/suggestions on input focus.
//      - Store/Load from localStorage().
// 2) Make API calls for drinks/ingredients.
// 3) Build out Drink component dynamically.
// 4) Make API calls for ingredients clicked.
// 5) Setup React Router so drinks can be saved/navigated to.


// ---------------------------------------------------------------------------
export default function App() {
    // NOTE: Components are re-rendered when state changes.
    const [searchTerm, setSearchTerm] = useState('')
    const [cocktailList, setCocktailList] = useState([])

    // searchTerm is grabbed from onChange event passed down to SearchInput.
    function updateSearchInput(event) {
        const newSearchTerm = sanitizeInput(event.target.value)
        setSearchTerm(newSearchTerm)
    }

    function getDrinks() {
        console.log(`Hello from App -> ${searchTerm}`)
        clearScreen()
        // TODO: Make an API call with the searchTerm.
        // TODO: Build out the Drink component for each result.
    }

    function handleClearButton() {
        clearScreen()
        clearInput()
    }

    function clearScreen() {
        setCocktailList([])
    }

    function clearInput() {
        setSearchTerm("")
    }

    function handleEnterKeyDown(event) {
        if (event.key === 'Enter') {
            console.log("Enter key pressed")
            getDrinks()
        }
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
            <CocktailsView/>
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

const CocktailsView = (props) => {
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
                <a href="https://7minutes.dev" target="_blank" rel="noreferrer">7 Minutes Dev</a>
            </p>
            <Counter/>
        </footer>
    )
}

const LoadingIcon = (props) => {
    return (
        <div className="lds-ellipsis">
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

// // Get the drinks from the API and display them on screen.
// // Clears any previously existing drinks on screen.
// async function getDrinks(choice = null) {
//     clearScreen()
//     if (!choice)
//         choice = sanitizeInput(searchInput.value)
//
//     // Store choice in localStorage to display as history.
//     addSearchToLocalHistory(choice)
//
//     const drinkURL = `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${choice}`
//     const ingredientURL = `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${choice}`
//
//     errors.clearErrors()
//     toggleLoadingIcon()
//     const nameResponse = fetchDrinksByName(drinkURL)
//     const ingredientResponse = await fetchDrinksByIngredient(ingredientURL)
//     fetchedDrinks.push(nameResponse, ingredientResponse)
//     // We should wait for all drink API fetches to complete successfully, otherwise
//     // we run into issues where drinks are rendered before the API has responded,
//     // resulting in empty spaces and missing drinks or information.
//     Promise.allSettled(fetchedDrinks)
//         .then(() => {
//             setupDrinkListeners()
//             revealDrinks()
//             errors.renderErrors()
//         })
// }

// Reset the page to its empty state.
// function clearScreen() {
//     cocktailList.innerHTML = ''
//     drinksOnDisplay = {}
// }