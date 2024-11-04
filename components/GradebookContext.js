import { createContext, useState } from 'react';
export const GradebookContext = createContext();

export const GradeBookProvider = ({ children }) => {
    const [thresholds,setThresholds] = useState({
        APlus: 90,
        BPlus: 80,
        CPlus:70
    });

    return (
        <GradebookContext.Provider value={{ thresholds, setThresholds}}>
            {children}
        </GradebookContext.Provider>
    )
}