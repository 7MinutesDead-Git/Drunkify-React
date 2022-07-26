import { createContext, useState } from 'react'


export const searchDetailsContext = createContext()


export default function SearchDetailsProvider(props) {
    // this state will be shared with all components
    const [searchDetails, setSearchDetails] = useState()

    return (
        // this is the provider providing state
        <searchDetailsContext.Provider value={[searchDetails, setSearchDetails]}>
            {props.children}
        </searchDetailsContext.Provider>
    );
};
