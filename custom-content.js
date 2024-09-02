const getContent = (componentName, importPath, dataRead) => {
return undefined;
`
import { InitComponent } from "src/app/mocks/InitComponent"
import { render } from '@testing-library/react'
import ${componentName} from './${importPath.replace('.tsx', '')}'
import * as hook from 'src/app/plugins/i18n/localization-hook'
import * as rredux from 'react-redux'
import * as phook from 'src/app/hooks/permissions-hook'

describe('${componentName}', () => {
  describe('render page', () => {
    const Component = (
      <InitComponent
        path={[{pathname: '/parameter', state: {}}]}
        children={<${componentName} {...{} as any} />}
      />
    );

    test('${componentName} rendered', async () => {
      jest.spyOn(hook, 'useLocalizationHook').mockReturnValue({t: ()=>{}} as any)
      jest.spyOn(rredux, 'useSelector').mockReturnValue({menu: []} as any)
      jest.spyOn(phook, 'usePermissions').mockReturnValue({hasAccess: () => (true)} as any)
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