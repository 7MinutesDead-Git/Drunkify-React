import React, {useState, useEffect} from 'react'


export default function Drink(props) {
    // ----------------------------------------------------------------------------
    // API call results passed down as props.
    const drinkName = props.drinkData['strDrink']
    const drinkImageURL = props.drinkData['strDrinkThumb']
    const instructions = props.drinkData['strInstructions']
    // ----------------------------------------------------------------------------
    // TODO: Need a props.clickIngredient function that makes a new API call when ingredient is clicked.
    function getFormattedInstructions() {
        const result = []
        if (instructions) {
            const array = instructions.split('.')
            for (const instruction of array)
                if (instruction.length > 0)
                    result.push(<p>${instruction}.</p>)
        }
        else {
            // TODO: Add button to open form to submit new instructions.
            result.push(<p>No instructions found!</p>)
        }
        return result
    }

    // ----------------------------------------------------------------------------
    return (
        <>
            <img src={drinkImageURL} alt={drinkName}/>
            <h3>{drinkName}</h3>
            <Ingredients drinkData={props.drinkData} drinkName={drinkName} clickIngredient={props.clickIngredient}/>
            <Instructions>
                {getFormattedInstructions()}
            </Instructions>
        </>
    )
}

const Instructions = (props) => {
    return (
        <div className="instructions">
            {props.children}
        </div>
    )
}

const Ingredient = (props) => {
    return (
        <li className="ingredient" key={props.uniqueKey}>
            <span onClick={props.clickIngredient}>{props.ingredientName}</span>: {props.measurement}
        </li>
    )
}

const Ingredients = (props) => {
    function getIngredients() {
        const arrayOfIngredients = []
        const measurementPairs = {}
        // To match the ingredients with their measurements, we can check the last character of the key name
        // since each measurement and ingredient name have a matching number suffix.
        // NOTE: This works so long as there isn't more than 10 ingredients.
        // NOTE: If the API ever stops returning ingredients before measurements in the future,
        //  we'll need to refactor this.
        // TODO: Refactor all of this to use React stuff.
        let index = 0
        for (const key in props.drinkData) {
            const suffix = key.charAt(key.length - 1)
            if (key.includes('Ingredient') && drinkPropertyIsValid(key)) {
                measurementPairs[suffix] = props.drinkData[key]
            }
            if (key.includes('Measure') && drinkPropertyIsValid(key) && measurementPairs[suffix].length > 0) {
                const measurement = props.drinkData[key]
                const ingredientName = measurementPairs[suffix]
                const uniqueKey = `${ingredientName}${index++}`
                arrayOfIngredients.push(
                    <Ingredient measurement={measurement}
                                ingredientName={ingredientName}
                                uniqueKey={uniqueKey}
                                onClick={props.clickIngredient}
                    />
                )
            }
        }
        // If there are no ingredients, add a button for submitting new ingredients.
        if (arrayOfIngredients.length === 0) {
            const missingIngredientOptions = (
                <>
                    <li>No ingredients listed. Submit some!</li>
                    <button>Submit ingredient</button>
                </>
            )
            arrayOfIngredients.push(missingIngredientOptions)
        }
        return arrayOfIngredients
    }

    // Check if given drink property key is not blank and not null.
    function drinkPropertyIsValid(key) {
        return props.drinkData[key] !== null && props.drinkData[key].length > 0
    }

    return (
        <ul className="ingredients">
            {getIngredients()}
        </ul>
    )
}