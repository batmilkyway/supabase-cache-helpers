import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { fireEvent, screen } from '@testing-library/react';
import React, { useState } from 'react';

import { useInsertMutation, useQuery, useUpdateMutation } from '../../src';
import type { Database } from '../database.types';
import { renderWithConfig } from '../utils';

const TEST_PREFIX = 'postgrest-swr-update';

describe('useUpdateMutation', () => {
  let client: SupabaseClient<Database>;
  let provider: Map<any, any>;
  let testRunPrefix: string;

  beforeAll(async () => {
    testRunPrefix = `${TEST_PREFIX}-${Math.floor(Math.random() * 100)}`;
    client = createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_ANON_KEY as string,
    );
    await client
      .from('serial_key_table')
      .delete()
      .ilike('value', `${TEST_PREFIX}%`);
    await client.from('contact').delete().ilike('username', `${TEST_PREFIX}%`);
  });

  beforeEach(() => {
    provider = new Map();
  });

  it('should update existing cache item with multi primary key', async () => {
    const NAME_1 = `${testRunPrefix}-1`;
    const NAME_2 = `${testRunPrefix}-2`;

    function Page() {
      const [success, setSuccess] = useState<boolean>(false);
      const { data } = useQuery(
        client
          .from('multi_pk')
          .select('id_1,id_2,name')
          .in('name', [NAME_1, NAME_2]),
        {
          revalidateOnFocus: false,
          revalidateOnReconnect: false,
        },
      );
      const { trigger: insert } = useInsertMutation(client.from('multi_pk'), [
        'id_1',
        'id_2',
      ]);
      const { trigger: update } = useUpdateMutation(
        client.from('multi_pk'),
        ['id_1', 'id_2'],
        null,
        {
          onSuccess: () => setSuccess(true),
        },
      );
      return (
        <div>
          <div
            data-testid="insert"
            onClick={async () =>
              await insert([{ id_1: 0, id_2: 0, name: NAME_1 }])
            }
          />
          <div
            data-testid="update"
            onClick={async () =>
              await update({
                id_1: 0,
                id_2: 0,
                name: NAME_2,
              })
            }
          />
          <span>
            {data?.find((d) => [NAME_1, NAME_2].includes(d.name ?? ''))?.name}
          </span>
          <span data-testid="success">{`success: ${success}`}</span>
        </div>
      );
    }

    renderWithConfig(<Page />, { provider: () => provider });
    fireEvent.click(screen.getByTestId('insert'));
    await screen.findByText(NAME_1, {}, { timeout: 10000 });
    fireEvent.click(screen.getByTestId('update'));
    await screen.findByText(NAME_2, {}, { timeout: 10000 });
    await screen.findByText('success: true', {}, { timeout: 10000 });
  });

  it('should update existing cache item with serial primary key', async () => {
    const VALUE_1 = `${testRunPrefix}-1`;
    const VALUE_2 = `${testRunPrefix}-2`;

    function Page() {
      const [success, setSuccess] = useState<boolean>(false);
      const { data, count } = useQuery(
        client
          .from('serial_key_table')
          .select('id,value', { count: 'exact' })
          .in('value', [VALUE_1, VALUE_2]),
        {
          revalidateOnFocus: false,
          revalidateOnReconnect: false,
        },
      );
      const { trigger: insert } = useInsertMutation(
        client.from('serial_key_table'),
        ['id'],
      );
      const { trigger: update } = useUpdateMutation(
        client.from('serial_key_table'),
        ['id'],
        null,
        {
          onSuccess: () => setSuccess(true),
        },
      );
      return (
        <div>
          <div
            data-testid="insert"
            onClick={async () => await insert([{ value: VALUE_1 }])}
          />
          <div
            data-testid="update"
            onClick={async () =>
              await update({
                id: (data ?? []).find((d) => d.value === VALUE_1)?.id,
                value: VALUE_2,
              })
            }
          />
          <span>
            {
              data?.find((d) => [VALUE_1, VALUE_2].includes(d.value ?? ''))
                ?.value
            }
          </span>
          <span data-testid="count">{`count: ${count}`}</span>
          <span data-testid="success">{`success: ${success}`}</span>
        </div>
      );
    }

    renderWithConfig(<Page />, { provider: () => provider });
    await screen.findByText('count: 0', {}, { timeout: 10000 });
    fireEvent.click(screen.getByTestId('insert'));
    await screen.findByText(VALUE_1, {}, { timeout: 10000 });
    expect(screen.getByTestId('count').textContent).toEqual('count: 1');
    fireEvent.click(screen.getByTestId('update'));
    await screen.findByText(VALUE_2, {}, { timeout: 10000 });
    expect(screen.getByTestId('count').textContent).toEqual('count: 1');
    await screen.findByText('success: true', {}, { timeout: 10000 });
  });

  it('should update existing cache item', async () => {
    const USERNAME_1 = `${testRunPrefix}-2`;
    const USERNAME_2 = `${testRunPrefix}-3`;
    function Page() {
      const [success, setSuccess] = useState<boolean>(false);
      const { data, count } = useQuery(
        client
          .from('contact')
          .select('id,username', { count: 'exact' })
          .in('username', [USERNAME_1, USERNAME_2]),
        {
          revalidateOnFocus: false,
          revalidateOnReconnect: false,
        },
      );
      const { trigger: insert } = useInsertMutation(client.from('contact'), [
        'id',
      ]);
      const { trigger: update } = useUpdateMutation(
        client.from('contact'),
        ['id'],
        null,
        {
          onSuccess: () => setSuccess(true),
        },
      );
      return (
        <div>
          <div
            data-testid="insert"
            onClick={async () => await insert([{ username: USERNAME_1 }])}
          />
          <div
            data-testid="update"
            onClick={async () =>
              await update({
                id: (data ?? []).find((d) => d.username === USERNAME_1)?.id,
                username: USERNAME_2,
              })
            }
          />
          <span>
            {
              data?.find((d) =>
                [USERNAME_1, USERNAME_2].includes(d.username ?? ''),
              )?.username
            }
          </span>
          <span data-testid="count">{`count: ${count}`}</span>
          <span data-testid="success">{`success: ${success}`}</span>
        </div>
      );
    }

    renderWithConfig(<Page />, { provider: () => provider });
    await screen.findByText('count: 0', {}, { timeout: 10000 });
    fireEvent.click(screen.getByTestId('insert'));
    await screen.findByText(USERNAME_1, {}, { timeout: 10000 });
    expect(screen.getByTestId('count').textContent).toEqual('count: 1');
    fireEvent.click(screen.getByTestId('update'));
    await screen.findByText(USERNAME_2, {}, { timeout: 10000 });
    expect(screen.getByTestId('count').textContent).toEqual('count: 1');
    await screen.findByText('success: true', {}, { timeout: 10000 });
  });
});
