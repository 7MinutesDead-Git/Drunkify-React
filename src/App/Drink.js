import React, {useState, useEffect} from 'react'


export default function Drink(props) {
    // ----------------------------------------------------------------------------
    // TODO: Recreate click functionality:
    //         button.addEventListener('click', (e) => {
    //             // Search by ingredient just by clicking on the ingredient link.
    //             if (e.target.tagName === 'A') {
    //                 searchInput.value = e.target.innerText
    //                 getDrinks(searchInput.value)
    //             }
    //             else
    //                 toggleDrinkFocus(button)
    //         })

    // ----------------------------------------------------------------------------
    // TODO: Get all drink data from API call results, maybe passed down as props?
    const drinkName = props.drinkName
    const drinkImageURL = props.drinkImageURL

    // This will be an array of p tags.
    const instructions = props.instructions.map((instruction, index) => {
        return <p key={index}>{instruction}</p>
    })

    // This will be an array of li tags.
    // TODO: Ingredients will be pairs of ingredient names and amounts.
    //  This might require destructuring with Object.keys() or similar.. we'll see.
    const ingredients = props.ingredients.map((ingredient, index) => {
        const uniqueKey = `${drinkName}${ingredient}${index}`
        return (
            <li key={uniqueKey}>
                <a href={ingredient}>{ingredient}</a>: {props.amounts[index]}
            </li>
        )
    })

    // ----------------------------------------------------------------------------
    return (
        <>
            <img src={drinkImageURL} alt={drinkName}/>
            <h3>{drinkName}</h3>
            <ul className="ingredients">
                {ingredients}
            </ul>
            <div className="instructions">

            </div>
        </>
    )
}