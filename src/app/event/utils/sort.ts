export class Sort {

    private sortOrder = 1;
    private collator = new Intl.Collator(undefined, {
        numeric: true,
        sensitivity: "base",
    })

    constructor() { }

    public startSort(property, order) {
        if (order === "desc") {
            this.sortOrder = -1;
        }
        return (a, b) => { 
            return this.collator.compare(a[property], b[property]) * this.sortOrder;
        }
    
    }

}