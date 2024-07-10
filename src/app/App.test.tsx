import { InitComponent } from "src/app/mocks/InitComponent"
import { render } from '@testing-library/react'
import {App} from './App'

describe('App', () => {
  describe('render page', () => {
    const Component = (
      <InitComponent
        path={['/']}
        children={<App {...{} as any} />}
      />
    );

    test('App rendered', async () => {
      render(Component)
    })
  })
})