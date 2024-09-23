import { gql } from 'graphql-request';


export const NSQuery = gql`
query App($path: String) {
  saas_files_v2(path: $path) {
    path
    name
    app {
      name
    }
		resourceTemplates {
      name
      url
      targets {
        namespace {
          path
        }
				ref
      }
    }
  }
}
`;