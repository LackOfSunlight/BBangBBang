function Add(a:number,b:number):number{
    const c:number = a+b;
    return c;
}

describe('add function', () =>{
    it('test', () =>{
        expect(Add(1,2)).toBe(3);
    })
});

test('test', () =>{
    expect(Add(1,2)).toBe(3);
});