import React, {useState, useEffect} from 'react'


export default function Drink(props) {
    // TODO: Need a props.clickIngredient function that makes a new API call when ingredient is clicked.

    // ----------------------------------------------------------------------------
    // API call results passed down as props.
    const drinkName = props.drinkData['strDrink']
    const drinkImageURL = props.drinkData['strDrinkThumb']
    const instructions = props.drinkData['strInstructions'].map((instruction, index) => {
        const instructionKey = `${drinkName}${instruction.slice(0, 4)}${index}`
        return <p key={instructionKey}>{instruction}</p>
    })

    // ----------------------------------------------------------------------------
    return (
        <>
            <img src={drinkImageURL} alt={drinkName}/>
            <h3>{drinkName}</h3>
            <Ingredients drinkData={props.drinkData} drinkName={drinkName} clickIngredient={props.clickIngredient}/>
            <div className="instructions">
                {instructions}
            </div>
        </>
    )
}

function Ingredients(props) {
    function getIngredients() {
        const arrayOfIngredients = []
        const measurementPairs = {}
        // To match the ingredients with their measurements, we can check the last character of the key name
        // since each measurement and ingredient name have a matching number suffix.
        // NOTE: This works so long as there isn't more than 10 ingredients.
        // NOTE: If the API ever stops returning ingredients before measurements in the future,
        //  we'll need to refactor this.
        // TODO: Refactor all of this to use React stuff.
        for (const key in props.drinkData) {
            const suffix = key.charAt(key.length - 1)
            if (key.includes('Ingredient') && drinkPropertyIsValid(key)) {
                measurementPairs[suffix] = props.drinkData[key]
            }
            if (key.includes('Measure') && drinkPropertyIsValid(key) && measurementPairs[suffix].length > 0) {
                const measurement = props.drinkData[key]
                const ingredient = (
                    <li className="ingredient">
                        <span onClick={props.clickIngredient}>{measurementPairs[suffix]}</span>: {measurement}
                    </li>
                )
                arrayOfIngredients.push(ingredient)
            }
        }
        // If there are no ingredients, add a button for submitting new ingredients.
        if (ingredients.length === 0) {
            const missingIngredientOptions = (
                <>
                    <li>No ingredients listed. Submit some!</li>
                    <button>Submit ingredient</button>
                </>
            )
            ingredients.push(missingIngredientOptions)
        }
        return ingredients
    }

    // Check if given drink property key is not blank and not null.
    function drinkPropertyIsValid(key) {
        return props.drinkData[key] !== null && props.drinkData[key].length > 0
    }

    // TODO: Ingredients will be pairs of ingredient names and amounts.
    //  This might require destructuring with Object.keys() or similar.. we'll see.
    // const ingredients = getIngredients().map((ingredient, index) => {
    //     const uniqueKey = `${props.drinkName}${ingredient}${index}`
    //     return (
    //         <li key={uniqueKey}>
    //             <a href={ingredient}>{ingredient}</a>: {props.amounts[index]}
    //         </li>
    //     )
    // })
    const ingredients = getIngredients()

    return (
        <ul className="ingredients">
            {ingredients}
        </ul>
    )
}