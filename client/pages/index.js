import Link from 'next/link';

// Page component: receives `currentUser` as a prop from _app.tsx AppComponent function
// (injected into all pages after being fetched at the app level)
const Landing = ({ currentUser, tickets }) => {
  const ticketList = tickets.map((ticket) => {
    return (
      <tr key={ticket.id}>
        <td>{ticket.title}</td>
        <td>{ticket.price}</td>
        <td>
          <Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>
            View
          </Link>
        </td>
      </tr>
    );
  });

  return (
    <div>
      <h1>Tickets</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>{ticketList}</tbody>
      </table>
    </div>
  );
};

// Page-level getInitialProps: receives (context, client, currentUser)
// which are forwarded by _app.tsx when calling each page’s getInitialProps
// i.e. from AppComponent.getInitialProps
Landing.getInitialProps = async (context, client, currentUser) => {
  const { data } = await client.get('/api/tickets');

  return { tickets: data };
};

export default Landing;
