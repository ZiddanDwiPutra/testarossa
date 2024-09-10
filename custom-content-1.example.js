const getContent = (componentName, importPath, dataRead) => {
return `
    import { InitComponent } from "src/app/mocks/InitComponent"
    import { render } from '@testing-library/react'
    import ${componentName} from './${importPath.replace('.tsx', '')}'
    
    describe('${componentName}', () => {
      describe('render page', () => {
        const Component = (
          <InitComponent
            path={['/']}
            children={<${componentName} {...{} as any} />}
          />
        );
    
        test('${componentName} rendered', async () => {
          render(Component)
        })
      })
      
      afterAll(()=>{
        jest.clearAllMocks()
      })
    })
`
} 
    
module.exports = { 
    getContent    
}