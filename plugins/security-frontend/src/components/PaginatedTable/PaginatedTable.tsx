import * as React from 'react';
import Paper from '@mui/material/Paper';
import {
  Grid,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography
} from '@material-ui/core';
import { createTheme, ThemeProvider } from '@mui/material/styles';

interface Column {
  id: 'vulnerability' | 'severity' | 'package' | 'fixed version';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: number) => string;
}

const theme = createTheme({
  typography: {
    subtitle1: {
      fontSize: 12,
    },
  },
});


export const PaginatedTable = (grypeData: any) => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const collectVulnerabilityData = () => {
    
  }

  const RowHead = () => {
    return (
      <TableHead>
        <TableRow>
          <TableCell align="center">
            <Typography>Vulnerability</Typography>
          </TableCell>
          <TableCell align="center">
            <Typography>Severity</Typography>
          </TableCell>
          <TableCell align="center">
            <Typography>Package</Typography>
          </TableCell>
          <TableCell align="center">
            <Typography>Type</Typography>
          </TableCell>
          <TableCell align="center">
            <Typography>Fixed Version</Typography>
          </TableCell>
        </TableRow>
      </TableHead>
    );
  };

  const RowBody = ({ result }: { result: any }) => {
    return (
      <TableRow>
        <TableCell align="center">
          <Typography align="center">
            <Link
              href={result?.vulnerability?.dataSource}
              underline="hover"
              target="_blank"
            >
              {result?.vulnerability?.id}
            </Link>
          </Typography>
        </TableCell>
        <TableCell align="center">
          <Typography align="center">
            {result?.vulnerability?.severity}
          </Typography>
        </TableCell>
        <TableCell align="center">
          <Typography align="center">
            {result?.artifact?.name}
          </Typography>
        </TableCell>
        <TableCell align="center">
          <Typography align="center">
            {result?.artifact?.type}
          </Typography>
        </TableCell>
        <TableCell align="center">
          <Typography align="center">
            {result?.vulnerability?.fix.versions[0]}
          </Typography>
        </TableCell>
      </TableRow>
    );
  };

  const ShowTable = () => {
    return (
      <Table aria-label="simple table">
        <RowHead />
        <TableBody>
          {/* {grypeData[1]?.ignoredMatches?.map((vulnerability) => ( */}
          {grypeData?.grypeData?.matches?.map((vulnerability) => (
            <RowBody result={vulnerability} />
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <ThemeProvider theme={theme}>
    <Grid container spacing={3} direction="column">
      <TableContainer>
        <ShowTable />
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={grypeData?.grypeData?.matches?.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Grid>
    </ThemeProvider>
  );
}