import WoTLibrary from "./WoTLibrary";


global.fetch = jest.fn(() => {
        return Promise.resolve({
            status: 200,
            json: () => Promise.resolve({value: 1.42, timestamp: 8247583475})
        })
    }
);

const wot = new WoTLibrary();
wot.td = {
    properties: {
        testProperty: {
            type: 'number',
            title: 'Test Property',
            forms: [
                {
                    "href": "/light/Color",
                    "op": [
                        "readproperty",
                        "observeproperty",
                        "writeproperty"
                    ]
                }
            ]
        },
        wrongTypeProperty: {
            type: 'string',
            title: 'Test Property',
            forms: [
                {
                    "href": "/light/Color",
                    "op": [
                        "readproperty",
                        "observeproperty",
                        "writeproperty"
                    ]
                }
            ]
        }
    }
}
describe('WOTLibrary ReadProperty Testing', () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    test('readproperty successfully', async () => {
        const result = await wot.readProperty('testProperty')
        expect(result).toEqual(1.42)
    })

    test('readproperty failed', async () => {
        fetch.mockImplementationOnce(() => Promise.resolve({
            status: 400,
            statusText: "not found",
            json: () => Promise.resolve({error: "This is an Error"})
        }));
        try {
            const result = await wot.readProperty('testProperty');
        } catch (e)
        {
            expect(e).toEqual('Error: not found');
        }
    })

    test('readproperty wrong type returned', async () => {
        try {
            const result = await wot.readProperty('wrongTypeProperty');
        } catch (e) {

            expect(e).toEqual(new SyntaxError('Value does not fit to dataschema'));
        }
    })
});

describe('WOTLibrary WriteProperty Testing', () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    test('writeprperty successfully', async () => {
        const result = await wot.writeProperty('testProperty', 1.42)
        expect(result).toEqual({value: 1.42, timestamp: 8247583475})
    })

    test( 'writeproperty fails', async () => {
        fetch.mockImplementationOnce(() => Promise.resolve({
            status: 400,
            statusText: "not found",
            json: () => Promise.resolve({error: "This is an Error"})
        }));
        try {
            const result = await wot.writeProperty('testProperty', 1.42);
        } catch (e)
        {
            expect(e).toEqual('Error: not found');
        }
    })

    test('writeproperty wrong type given', async () => {
        try {
            const result = await wot.writeProperty('wrongTypeProperty', 1.42);
        } catch (e) {
            expect(e).toEqual(new SyntaxError('Value does not fit to dataschema'));
        }
    })

});


