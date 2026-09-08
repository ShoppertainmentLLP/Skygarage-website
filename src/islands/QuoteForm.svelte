<script lang="ts">
  import { actions, isInputError } from 'astro:actions';

  type Option = { id: number; name: string; group?: string };

  let {
    services = [],
    locations = [],
    preselectedServiceId = null,
    preselectedLocationId = null,
  }: {
    services: Option[];
    locations: Option[];
    preselectedServiceId?: number | null;
    preselectedLocationId?: number | null;
  } = $props();

  let step = $state(1);
  let submitting = $state(false);
  let doneId = $state<number | null>(null);
  let errors = $state<Record<string, string>>({});

  let serviceId = $state(preselectedServiceId ? String(preselectedServiceId) : '');
  let locationId = $state(preselectedLocationId ? String(preselectedLocationId) : '');
  let details = $state('');
  let vehicleMake = $state('');
  let vehicleModel = $state('');
  let vehicleYear = $state('');
  let name = $state('');
  let phone = $state('');
  let email = $state('');

  const groups = [...new Set(services.map((s) => s.group))];

  function next() {
    errors = {};
    if (step === 2) {
      if (!vehicleMake.trim()) errors.vehicleMake = 'Enter your car’s make';
      if (!vehicleModel.trim()) errors.vehicleModel = 'Enter the model';
      if (Object.keys(errors).length) return;
    }
    step += 1;
  }

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    errors = {};
    submitting = true;
    const formData = new FormData(event.target as HTMLFormElement);
    const { data, error } = await actions.submitQuote(formData);
    submitting = false;
    if (error) {
      if (isInputError(error)) {
        errors = Object.fromEntries(
          Object.entries(error.fields).map(([k, v]) => [k, v?.[0] ?? 'Check this field']),
        );
        // Jump back to the step containing the first invalid field.
        if (errors.vehicleMake || errors.vehicleModel || errors.vehicleYear) step = 2;
      } else {
        errors.form = 'Something went wrong sending your request. Please try again, or WhatsApp us instead.';
      }
      return;
    }
    doneId = data.id;
  }
</script>

{#if doneId}
  <div class="rounded-[3px] border-l-4 border-gold bg-surface p-6">
    <h3 class="subtitle">Request received — you're #{doneId}</h3>
    <p class="mt-2 text-graphite">
      Garages matching your job are being notified. Expect quotes on your phone shortly — usually
      within working hours the same day.
    </p>
    <a href="/book/compare/" class="mt-4 inline-block font-bold text-gold-light hover:underline"
      >Compare garages while you wait</a
    >
  </div>
{:else}
  <form onsubmit={submit} class="rounded-[3px] bg-surface p-6">
    <ol class="mb-5 flex gap-2 text-sm font-bold" aria-label="Form progress">
      {#each ['The job', 'Your car', 'Contact'] as label, i}
        <li
          class="flex-1 border-t-4 pt-1.5 {step > i ? 'border-gold text-white' : 'border-rule text-graphite'}"
        >
          {label}
        </li>
      {/each}
    </ol>

    <div class:hidden={step !== 1}>
      <label class="field-label" for="qf-service">What does your car need?</label>
      <select id="qf-service" name="serviceId" bind:value={serviceId} class="field">
        <option value="">Not sure — let garages advise</option>
        {#each groups as group}
          <optgroup label={group}>
            {#each services.filter((s) => s.group === group) as s}
              <option value={String(s.id)}>{s.name}</option>
            {/each}
          </optgroup>
        {/each}
      </select>

      <label class="field-label mt-4" for="qf-location">Where are you?</label>
      <select id="qf-location" name="locationId" bind:value={locationId} class="field">
        <option value="">Anywhere in the UAE</option>
        {#each locations as l}
          <option value={String(l.id)}>{l.name}</option>
        {/each}
      </select>

      <label class="field-label mt-4" for="qf-details">Describe the problem (optional)</label>
      <textarea
        id="qf-details"
        name="details"
        bind:value={details}
        rows="3"
        class="field"
        placeholder="e.g. grinding noise when braking at low speed"
      ></textarea>

      <button type="button" onclick={next} class="btn btn-primary mt-5 w-full">Next: your car</button>
    </div>

    <div class:hidden={step !== 2}>
      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label class="field-label" for="qf-make">Make</label>
          <input id="qf-make" name="vehicleMake" bind:value={vehicleMake} class="field" placeholder="Toyota" />
          {#if errors.vehicleMake}<p class="mt-1 text-sm text-alert">{errors.vehicleMake}</p>{/if}
        </div>
        <div>
          <label class="field-label" for="qf-model">Model</label>
          <input id="qf-model" name="vehicleModel" bind:value={vehicleModel} class="field" placeholder="Land Cruiser" />
          {#if errors.vehicleModel}<p class="mt-1 text-sm text-alert">{errors.vehicleModel}</p>{/if}
        </div>
      </div>
      <label class="field-label mt-4" for="qf-year">Year (optional)</label>
      <input id="qf-year" name="vehicleYear" bind:value={vehicleYear} class="field" inputmode="numeric" placeholder="2021" />
      {#if errors.vehicleYear}<p class="mt-1 text-sm text-alert">{errors.vehicleYear}</p>{/if}

      <div class="mt-5 flex gap-3">
        <button type="button" onclick={() => (step = 1)} class="btn btn-quiet flex-1">Back</button>
        <button type="button" onclick={next} class="btn btn-primary flex-1">Next: contact</button>
      </div>
    </div>

    <div class:hidden={step !== 3}>
      <label class="field-label" for="qf-name">Your name</label>
      <input id="qf-name" name="name" bind:value={name} class="field" autocomplete="name" />
      {#if errors.name}<p class="mt-1 text-sm text-alert">{errors.name}</p>{/if}

      <label class="field-label mt-4" for="qf-phone">Phone (garages quote via call/WhatsApp)</label>
      <input id="qf-phone" name="phone" bind:value={phone} class="field" inputmode="tel" autocomplete="tel" placeholder="+971 50 123 4567" />
      {#if errors.phone}<p class="mt-1 text-sm text-alert">{errors.phone}</p>{/if}

      <label class="field-label mt-4" for="qf-email">Email (optional)</label>
      <input id="qf-email" name="email" bind:value={email} class="field" type="email" autocomplete="email" />
      {#if errors.email}<p class="mt-1 text-sm text-alert">{errors.email}</p>{/if}

      {#if errors.form}<p class="mt-4 rounded-[3px] bg-alert-wash p-3 text-sm font-semibold text-alert">{errors.form}</p>{/if}

      <div class="mt-5 flex gap-3">
        <button type="button" onclick={() => (step = 2)} class="btn btn-quiet flex-1">Back</button>
        <button type="submit" disabled={submitting} class="btn btn-primary flex-1 disabled:opacity-60">
          {submitting ? 'Sending…' : 'Get my quotes'}
        </button>
      </div>
      <p class="mt-3 text-xs text-graphite">
        Free to use. Your details go only to garages that can do this job.
      </p>
    </div>
  </form>
{/if}
